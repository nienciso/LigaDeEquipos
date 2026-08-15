let equipos =
    JSON.parse(
        localStorage.getItem("equiposLiga")
    ) || [];

let torneoGenerado =
    JSON.parse(
        localStorage.getItem("torneoGenerado")
    ) || false;

let resultadosPartidos =
    JSON.parse(
        localStorage.getItem("resultadosLiga")
    ) || {};

let fechaActual =
    Number(
        localStorage.getItem("fechaActualLiga")
    ) || 0;

let fixture = [];


const seccionConfiguracion =
    document.getElementById("seccionConfiguracion");

const seccionTorneo =
    document.getElementById("seccionTorneo");

const nombreEquipo =
    document.getElementById("nombreEquipo");

const btnAgregarEquipo =
    document.getElementById("btnAgregarEquipo");

const btnGenerarTorneo =
    document.getElementById("btnGenerarTorneo");

const btnReset =
    document.getElementById("btnReset");

const listaEquipos =
    document.getElementById("listaEquipos");

const mensajeEquipo =
    document.getElementById("mensajeEquipo");


function guardarEquipos() {

    localStorage.setItem(
        "equiposLiga",
        JSON.stringify(equipos)
    );
}


function agregarEquipo() {

    const nombre =
        nombreEquipo.value.trim();

    mensajeEquipo.innerHTML = "";

    if (nombre === "") {

        mostrarMensaje(
            "Ingresá un nombre para el equipo.",
            "danger"
        );

        return;
    }

    const existe =
        equipos.some(
            equipo =>
                equipo.toLowerCase() ===
                nombre.toLowerCase()
        );

    if (existe) {

        mostrarMensaje(
            "Ese equipo ya fue agregado.",
            "warning"
        );

        return;
    }

    equipos.push(nombre);

    guardarEquipos();

    nombreEquipo.value = "";

    mostrarEquiposConfiguracion();

    mostrarMensaje(
        "Equipo agregado correctamente.",
        "success"
    );

    nombreEquipo.focus();
}


function mostrarMensaje(texto, tipo) {

    mensajeEquipo.innerHTML = `

        <div class="alert alert-${tipo} py-2 mb-0">
            ${texto}
        </div>

    `;

    setTimeout(() => {

        mensajeEquipo.innerHTML = "";

    }, 2500);
}


function mostrarEquiposConfiguracion() {

    listaEquipos.innerHTML = "";

    document.getElementById(
        "cantidadEquiposConfiguracion"
    ).textContent =
        `${equipos.length} equipos`;

    if (equipos.length === 0) {

        listaEquipos.innerHTML = `

            <p class="text-muted mb-0">
                Todavía no agregaste equipos.
            </p>

        `;

    } else {

        equipos.forEach(
            (equipo, indice) => {

                const item =
                    document.createElement("div");

                item.className =
                    "d-flex justify-content-between align-items-center border-bottom py-3";

                item.innerHTML = `

                    <div>

                        <strong>
                            ${indice + 1}.
                        </strong>

                        ${equipo}

                    </div>

                    <button
                        class="btn btn-outline-danger btn-sm"
                        onclick="eliminarEquipo(${indice})"
                    >
                        Eliminar
                    </button>

                `;

                listaEquipos.appendChild(item);
            }
        );
    }

    btnGenerarTorneo.disabled =
        equipos.length < 2;
}


function eliminarEquipo(indice) {

    equipos.splice(
        indice,
        1
    );

    guardarEquipos();

    mostrarEquiposConfiguracion();
}


btnAgregarEquipo.addEventListener(
    "click",
    agregarEquipo
);


nombreEquipo.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            agregarEquipo();
        }
    }
);


btnGenerarTorneo.addEventListener(
    "click",
    function () {

        if (equipos.length < 2) {

            return;
        }

        torneoGenerado = true;

        fechaActual = 0;

        resultadosPartidos = {};

        localStorage.setItem(
            "torneoGenerado",
            JSON.stringify(true)
        );

        localStorage.setItem(
            "fechaActualLiga",
            "0"
        );

        localStorage.setItem(
            "resultadosLiga",
            JSON.stringify({})
        );

        iniciarTorneo();
    }
);


function generarFixture(listaEquipos) {

    let equiposFixture =
        [...listaEquipos];

    if (
        equiposFixture.length % 2 !== 0
    ) {

        equiposFixture.push(
            "LIBRE"
        );
    }

    const cantidad =
        equiposFixture.length;

    const cantidadFechas =
        cantidad - 1;

    const partidosPorFecha =
        cantidad / 2;

    let rotacion =
        [...equiposFixture];

    const fixtureGenerado = [];

    for (
        let fecha = 0;
        fecha < cantidadFechas;
        fecha++
    ) {

        const partidosFecha = [];

        let libre = null;

        for (
            let partido = 0;
            partido < partidosPorFecha;
            partido++
        ) {

            const equipoA =
                rotacion[partido];

            const equipoB =
                rotacion[
                    cantidad - 1 - partido
                ];

            if (
                equipoA === "LIBRE"
            ) {

                libre = equipoB;

                continue;
            }

            if (
                equipoB === "LIBRE"
            ) {

                libre = equipoA;

                continue;
            }

            if (
                fecha % 2 === 0
            ) {

                partidosFecha.push({

                    local: equipoA,

                    visitante: equipoB

                });

            } else {

                partidosFecha.push({

                    local: equipoB,

                    visitante: equipoA

                });
            }
        }

        fixtureGenerado.push({

            partidos: partidosFecha,

            libre: libre

        });

        const fijo =
            rotacion[0];

        const resto =
            rotacion.slice(1);

        resto.unshift(
            resto.pop()
        );

        rotacion = [
            fijo,
            ...resto
        ];
    }

    return fixtureGenerado;
}


function iniciarTorneo() {

    fixture =
        generarFixture(
            equipos
        );

    seccionConfiguracion.classList.add(
        "d-none"
    );

    seccionTorneo.classList.remove(
        "d-none"
    );

    btnReset.classList.remove(
        "d-none"
    );

    actualizarEstadisticas();

    mostrarFecha();

    calcularTabla();

    actualizarPartidosCargados();
}


function actualizarEstadisticas() {

    document.getElementById(
        "totalEquipos"
    ).textContent =
        equipos.length;

    document.getElementById(
        "totalFechas"
    ).textContent =
        fixture.length;

    let totalPartidos = 0;

    fixture.forEach(fecha => {

        totalPartidos +=
            fecha.partidos.length;
    });

    document.getElementById(
        "totalPartidos"
    ).textContent =
        totalPartidos;
}


function mostrarFecha() {

    const contenedor =
        document.getElementById(
            "contenedorPartidos"
        );

    const equipoLibre =
        document.getElementById(
            "equipoLibre"
        );

    contenedor.innerHTML = "";

    document.getElementById(
        "numeroFecha"
    ).textContent =
        `Fecha ${fechaActual + 1}`;

    const datosFecha =
        fixture[fechaActual];

    if (
        datosFecha.libre
    ) {

        equipoLibre.classList.remove(
            "d-none"
        );

        equipoLibre.innerHTML = `

            <strong>
                Equipo libre:
            </strong>

            ${datosFecha.libre}

        `;

    } else {

        equipoLibre.classList.add(
            "d-none"
        );
    }

    datosFecha.partidos.forEach(

        (partido, indice) => {

            const idPartido =
                `${fechaActual}-${indice}`;

            const resultado =
                resultadosPartidos[
                    idPartido
                ] || "";

            const cargado =
                resultado !== "";

            const columna =
                document.createElement(
                    "div"
                );

            columna.className =
                "col-lg-6";

            columna.innerHTML = `

                <div class="partido">

                    <div class="estado-partido">

                        ${
                            cargado
                                ? "● RESULTADO CARGADO"
                                : "○ PENDIENTE"
                        }

                    </div>

                    <div class="mb-3">

                        <h5 class="mb-1">
                            ${partido.local}
                        </h5>

                        <span class="text-muted">
                            vs
                        </span>

                        <h5 class="mt-1">
                            ${partido.visitante}
                        </h5>

                    </div>

                    <label
                        class="form-label fw-bold"
                    >
                        Resultado
                    </label>

                    <select
                        class="form-select resultado-partido"
                        data-id="${idPartido}"
                    >

                        <option
                            value=""
                            ${
                                resultado === ""
                                    ? "selected"
                                    : ""
                            }
                        >
                            Seleccionar resultado
                        </option>

                        <option
                            value="local"
                            ${
                                resultado === "local"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Gana ${partido.local}
                        </option>

                        <option
                            value="empate"
                            ${
                                resultado === "empate"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Empate
                        </option>

                        <option
                            value="visitante"
                            ${
                                resultado === "visitante"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Gana ${partido.visitante}
                        </option>

                    </select>

                    <div class="mt-3 text-muted small">

                        Victoria = 3 puntos ·
                        Empate = 1 punto cada uno ·
                        Derrota = 0 puntos

                    </div>

                </div>

            `;

            contenedor.appendChild(
                columna
            );
        }
    );

    agregarEventosResultados();

    actualizarBotonesFechas();
}


function agregarEventosResultados() {

    const selects =
        document.querySelectorAll(
            ".resultado-partido"
        );

    selects.forEach(select => {

        select.addEventListener(

            "change",

            function () {

                const id =
                    this.dataset.id;

                const resultado =
                    this.value;

                if (
                    resultado === ""
                ) {

                    delete resultadosPartidos[
                        id
                    ];

                } else {

                    resultadosPartidos[
                        id
                    ] = resultado;
                }

                guardarResultados();

                calcularTabla();

                actualizarPartidosCargados();

                mostrarFecha();
            }
        );
    });
}


function guardarResultados() {

    localStorage.setItem(

        "resultadosLiga",

        JSON.stringify(
            resultadosPartidos
        )
    );
}


function calcularTabla() {

    const tabla = {};

    equipos.forEach(
        equipo => {

            tabla[equipo] = {

                equipo: equipo,

                puntos: 0

            };
        }
    );

    fixture.forEach(

        (datosFecha, numeroFecha) => {

            datosFecha.partidos.forEach(

                (partido, indice) => {

                    const idPartido =
                        `${numeroFecha}-${indice}`;

                    const resultado =
                        resultadosPartidos[
                            idPartido
                        ];

                    if (!resultado) {

                        return;
                    }

                    if (
                        resultado === "local"
                    ) {

                        tabla[
                            partido.local
                        ].puntos += 3;

                    } else if (
                        resultado === "visitante"
                    ) {

                        tabla[
                            partido.visitante
                        ].puntos += 3;

                    } else if (
                        resultado === "empate"
                    ) {

                        tabla[
                            partido.local
                        ].puntos += 1;

                        tabla[
                            partido.visitante
                        ].puntos += 1;
                    }
                }
            );
        }
    );

    const posiciones =
        Object.values(
            tabla
        );

    posiciones.sort(
        (a, b) =>
            b.puntos -
            a.puntos
    );

    mostrarTabla(
        posiciones
    );
}


function mostrarTabla(posiciones) {

    const tbody =
        document.getElementById(
            "tablaPosiciones"
        );

    tbody.innerHTML = "";

    posiciones.forEach(

        (equipo, indice) => {

            const fila =
                document.createElement(
                    "tr"
                );

            if (
                indice === 0
            ) {

                fila.classList.add(
                    "primero"
                );
            }

            fila.innerHTML = `

                <td>

                    <div class="posicion">
                        ${indice + 1}
                    </div>

                </td>

                <td class="nombre-tabla">
                    ${equipo.equipo}
                </td>

                <td class="puntos">
                    ${equipo.puntos}
                </td>

            `;

            tbody.appendChild(
                fila
            );
        }
    );
}


function actualizarPartidosCargados() {

    let cantidad = 0;

    fixture.forEach(

        (datosFecha, numeroFecha) => {

            datosFecha.partidos.forEach(

                (partido, indice) => {

                    const id =
                        `${numeroFecha}-${indice}`;

                    if (
                        resultadosPartidos[id]
                    ) {

                        cantidad++;
                    }
                }
            );
        }
    );

    document.getElementById(
        "partidosCargados"
    ).textContent =
        cantidad;
}


document.getElementById(
    "fechaSiguiente"
).addEventListener(

    "click",

    function () {

        if (
            fechaActual <
            fixture.length - 1
        ) {

            fechaActual++;

            guardarFechaActual();

            mostrarFecha();
        }
    }
);


document.getElementById(
    "fechaAnterior"
).addEventListener(

    "click",

    function () {

        if (
            fechaActual > 0
        ) {

            fechaActual--;

            guardarFechaActual();

            mostrarFecha();
        }
    }
);


function guardarFechaActual() {

    localStorage.setItem(
        "fechaActualLiga",
        fechaActual
    );
}


function actualizarBotonesFechas() {

    const anterior =
        document.getElementById(
            "fechaAnterior"
        );

    const siguiente =
        document.getElementById(
            "fechaSiguiente"
        );

    anterior.disabled =
        fechaActual === 0;

    siguiente.disabled =
        fechaActual ===
        fixture.length - 1;
}


btnReset.addEventListener(

    "click",

    function () {

        const confirmar =
            confirm(
                "¿Seguro que querés reiniciar el torneo? Se borrarán equipos y resultados."
            );

        if (!confirmar) {

            return;
        }

        localStorage.removeItem(
            "equiposLiga"
        );

        localStorage.removeItem(
            "resultadosLiga"
        );

        localStorage.removeItem(
            "torneoGenerado"
        );

        localStorage.removeItem(
            "fechaActualLiga"
        );

        equipos = [];

        resultadosPartidos = {};

        torneoGenerado = false;

        fechaActual = 0;

        fixture = [];

        seccionTorneo.classList.add(
            "d-none"
        );

        seccionConfiguracion.classList.remove(
            "d-none"
        );

        btnReset.classList.add(
            "d-none"
        );

        mostrarEquiposConfiguracion();
    }
);


function iniciarPagina() {

    if (
        torneoGenerado &&
        equipos.length >= 2
    ) {

        fixture =
            generarFixture(
                equipos
            );

        if (
            fechaActual >=
            fixture.length
        ) {

            fechaActual = 0;
        }

        iniciarTorneo();

    } else {

        mostrarEquiposConfiguracion();

        seccionConfiguracion.classList.remove(
            "d-none"
        );

        seccionTorneo.classList.add(
            "d-none"
        );

        btnReset.classList.add(
            "d-none"
        );
    }
}


iniciarPagina();