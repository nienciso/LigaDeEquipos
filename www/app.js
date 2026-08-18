let equipos = JSON.parse(localStorage.getItem("equiposLiga")) || [];
let torneoGenerado = JSON.parse(localStorage.getItem("torneoGenerado")) || false;
let modalidad = localStorage.getItem("modalidadLiga") || "liga";
let resultados = JSON.parse(localStorage.getItem("resultadosLiga")) || {};
let fechaActual = Number(localStorage.getItem("fechaActualLiga")) || 0;

let fixture = [];
let grupoA = [];
let grupoB = [];
let fixtureA = [];
let fixtureB = [];
let tablaActualA = [];
let tablaActualB = [];
let tablaActualLiga = [];

const seccionConfiguracion = document.getElementById("seccionConfiguracion");
const seccionTorneo = document.getElementById("seccionTorneo");
const modoLiga = document.getElementById("modoLiga");
const modoCopa = document.getElementById("modoCopa");
const nombreEquipo = document.getElementById("nombreEquipo");
const btnAgregarEquipo = document.getElementById("btnAgregarEquipo");
const btnGenerarTorneo = document.getElementById("btnGenerarTorneo");
const btnReset = document.getElementById("btnReset");
const btnDescargarImagen = document.getElementById("btnDescargarImagen");
const listaEquipos = document.getElementById("listaEquipos");
const mensajeEquipo = document.getElementById("mensajeEquipo");
const modalidadTorneo = document.getElementById("modalidadTorneo");

function guardarEquipos() {
    localStorage.setItem("equiposLiga", JSON.stringify(equipos));
}

function guardarResultados() {
    localStorage.setItem("resultadosLiga", JSON.stringify(resultados));
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

function agregarEquipo() {
    const nombre = nombreEquipo.value.trim();

    if (nombre === "") {
        mostrarMensaje("Ingresá un nombre para el equipo.", "danger");
        return;
    }

    const existe = equipos.some(
        equipo => equipo.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
        mostrarMensaje("Ese equipo ya fue agregado.", "warning");
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

function eliminarEquipo(indice) {
    equipos.splice(indice, 1);

    guardarEquipos();

    mostrarEquiposConfiguracion();
}

function mostrarEquiposConfiguracion() {
    listaEquipos.innerHTML = "";

    document.getElementById(
        "cantidadEquiposConfiguracion"
    ).textContent = `${equipos.length} equipos`;

    if (equipos.length === 0) {
        listaEquipos.innerHTML = `
            <p class="text-muted mb-0">
                Todavía no agregaste equipos.
            </p>
        `;
    } else {
        equipos.forEach((equipo, indice) => {
            const item = document.createElement("div");

            item.className =
                "d-flex justify-content-between align-items-center border-bottom py-3";

            item.innerHTML = `
                <div>
                    <strong>${indice + 1}.</strong>
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
        });
    }

    actualizarRequisito();
}

function actualizarRequisito() {
    const texto = document.getElementById("textoRequisito");

    if (modalidadTorneo.value === "liga") {
        btnGenerarTorneo.disabled =
            equipos.length < 2;

        texto.textContent =
            "Necesitás al menos 2 equipos.";
    } else {
        const valido =
            equipos.length >= 4 &&
            equipos.length % 2 === 0;

        btnGenerarTorneo.disabled =
            !valido;

        texto.textContent =
            "Para Grupos + Eliminatorias necesitás al menos 4 equipos y una cantidad par.";
    }
}

function actualizarAyudaModalidad() {
    const ayuda =
        document.getElementById("ayudaModalidad");

    if (modalidadTorneo.value === "liga") {
        ayuda.textContent =
            "Todos los equipos juegan contra todos.";
    } else {
        ayuda.textContent =
            "Los equipos se dividen en Grupo A y Grupo B. Clasifican los dos mejores de cada grupo.";
    }

    actualizarRequisito();
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

modalidadTorneo.addEventListener(
    "change",
    actualizarAyudaModalidad
);

btnGenerarTorneo.addEventListener(
    "click",
    function () {
        modalidad =
            modalidadTorneo.value;

        if (
            modalidad === "liga" &&
            equipos.length < 2
        ) {
            return;
        }

        if (
            modalidad === "copa" &&
            (
                equipos.length < 4 ||
                equipos.length % 2 !== 0
            )
        ) {
            return;
        }

        torneoGenerado = true;
        resultados = {};
        fechaActual = 0;

        localStorage.setItem(
            "torneoGenerado",
            JSON.stringify(true)
        );

        localStorage.setItem(
            "modalidadLiga",
            modalidad
        );

        localStorage.setItem(
            "resultadosLiga",
            JSON.stringify({})
        );

        localStorage.setItem(
            "fechaActualLiga",
            "0"
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
        equiposFixture.push("LIBRE");
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
                rotacion[cantidad - 1 - partido];

            if (equipoA === "LIBRE") {
                libre = equipoB;
                continue;
            }

            if (equipoB === "LIBRE") {
                libre = equipoA;
                continue;
            }

            partidosFecha.push({
                local:
                    fecha % 2 === 0
                        ? equipoA
                        : equipoB,

                visitante:
                    fecha % 2 === 0
                        ? equipoB
                        : equipoA
            });
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

function generarPartidosGrupo(lista) {
    const partidos = [];

    for (
        let i = 0;
        i < lista.length;
        i++
    ) {
        for (
            let j = i + 1;
            j < lista.length;
            j++
        ) {
            partidos.push({
                local: lista[i],
                visitante: lista[j]
            });
        }
    }

    return partidos;
}

function dividirGrupos() {
    grupoA = [];
    grupoB = [];

    equipos.forEach((equipo, indice) => {
        if (indice % 2 === 0) {
            grupoA.push(equipo);
        } else {
            grupoB.push(equipo);
        }
    });

    fixtureA =
        generarPartidosGrupo(grupoA);

    fixtureB =
        generarPartidosGrupo(grupoB);
}

function crearResultadoVacio() {
    return {
        sets: [
            {
                local: "",
                visitante: ""
            },
            {
                local: "",
                visitante: ""
            },
            {
                local: "",
                visitante: ""
            }
        ]
    };
}

function normalizarResultado(resultado) {
    if (
        !resultado ||
        typeof resultado !== "object" ||
        !Array.isArray(resultado.sets)
    ) {
        return crearResultadoVacio();
    }

    return {
        sets: [0, 1, 2].map(indice => ({
            local:
                resultado.sets[indice]?.local ?? "",

            visitante:
                resultado.sets[indice]?.visitante ?? ""
        }))
    };
}

function setCompleto(local, visitante) {
    if (
        local === "" ||
        visitante === ""
    ) {
        return false;
    }

    const a = Number(local);
    const b = Number(visitante);

    if (
        !Number.isInteger(a) ||
        !Number.isInteger(b) ||
        a < 0 ||
        b < 0 ||
        a > 17 ||
        b > 17 ||
        a === b
    ) {
        return false;
    }

    const ganador =
        Math.max(a, b);

    const perdedor =
        Math.min(a, b);

    if (
        ganador === 15 &&
        perdedor <= 13
    ) {
        return true;
    }

    if (
        ganador === 16 &&
        perdedor === 14
    ) {
        return true;
    }

    if (
        ganador === 17 &&
        (
            perdedor === 15 ||
            perdedor === 16
        )
    ) {
        return true;
    }

    return false;
}

function obtenerGanadorSet(set) {
    if (
        !setCompleto(
            set.local,
            set.visitante
        )
    ) {
        return null;
    }

    return Number(set.local) >
        Number(set.visitante)
        ? "local"
        : "visitante";
}

function necesitaTercerSet(resultado) {
    const datos =
        normalizarResultado(resultado);

    const ganador1 =
        obtenerGanadorSet(datos.sets[0]);

    const ganador2 =
        obtenerGanadorSet(datos.sets[1]);

    return (
        ganador1 !== null &&
        ganador2 !== null &&
        ganador1 !== ganador2
    );
}

function calcularResultadoPartido(resultado) {
    const datos =
        normalizarResultado(resultado);

    const set1 =
        datos.sets[0];

    const set2 =
        datos.sets[1];

    const set3 =
        datos.sets[2];

    const ganador1 =
        obtenerGanadorSet(set1);

    const ganador2 =
        obtenerGanadorSet(set2);

    let setsLocal = 0;
    let setsVisitante = 0;

    let golesLocal = 0;
    let golesVisitante = 0;

    let puntosLocal = 0;
    let puntosVisitante = 0;

    let partidoCompleto = false;
    let usaTercerSet = false;

    if (ganador1 !== null) {
        golesLocal +=
            Number(set1.local);

        golesVisitante +=
            Number(set1.visitante);

        if (ganador1 === "local") {
            setsLocal++;
        } else {
            setsVisitante++;
        }
    }

    if (ganador2 !== null) {
        golesLocal +=
            Number(set2.local);

        golesVisitante +=
            Number(set2.visitante);

        if (ganador2 === "local") {
            setsLocal++;
        } else {
            setsVisitante++;
        }
    }

    if (
        ganador1 !== null &&
        ganador2 !== null
    ) {
        if (
            ganador1 === ganador2
        ) {
            partidoCompleto = true;

            if (setsLocal === 2) {
                puntosLocal = 3;
                puntosVisitante = 0;
            } else {
                puntosLocal = 0;
                puntosVisitante = 3;
            }
        } else {
            usaTercerSet = true;

            const ganador3 =
                obtenerGanadorSet(set3);

            if (ganador3 !== null) {
                golesLocal +=
                    Number(set3.local);

                golesVisitante +=
                    Number(set3.visitante);

                if (ganador3 === "local") {
                    setsLocal++;
                } else {
                    setsVisitante++;
                }

                partidoCompleto = true;

                if (setsLocal === 2) {
                    puntosLocal = 2;
                    puntosVisitante = 1;
                } else {
                    puntosLocal = 1;
                    puntosVisitante = 2;
                }
            }
        }
    }

    return {
        partidoCompleto,
        setsLocal,
        setsVisitante,
        golesLocal,
        golesVisitante,
        puntosLocal,
        puntosVisitante,
        usaTercerSet
    };
}

function obtenerGanador(
    partido,
    resultado
) {
    const resumen =
        calcularResultadoPartido(resultado);

    if (!resumen.partidoCompleto) {
        return null;
    }

    if (
        resumen.setsLocal >
        resumen.setsVisitante
    ) {
        return partido.local;
    }

    return partido.visitante;
}

function crearFilaSet(
    partido,
    idPartido,
    indiceSet,
    set
) {
    return `
        <div class="row g-2 align-items-center mb-2">

            <div class="col-2 fw-bold">
                Set ${indiceSet + 1}
            </div>

            <div class="col-5">
                <input
                    type="number"
                    min="0"
                    max="17"
                    step="1"
                    class="form-control text-center gol-set"
                    data-id="${idPartido}"
                    data-set="${indiceSet}"
                    data-equipo="local"
                    value="${set.local}"
                    placeholder="Goles"
                >
            </div>

            <div class="col-5">
                <input
                    type="number"
                    min="0"
                    max="17"
                    step="1"
                    class="form-control text-center gol-set"
                    data-id="${idPartido}"
                    data-set="${indiceSet}"
                    data-equipo="visitante"
                    value="${set.visitante}"
                    placeholder="Goles"
                >
            </div>

        </div>
    `;
}

function crearTarjetaPartido(
    partido,
    idPartido,
    tipo = "normal"
) {
    const resultado =
        normalizarResultado(
            resultados[idPartido]
        );

    const resumen =
        calcularResultadoPartido(resultado);

    let filasSets = `
        <div class="row g-2 align-items-end mb-2">

            <div class="col-2"></div>

            <div class="col-5 text-center">
                <strong>
                    ${partido.local}
                </strong>
            </div>

            <div class="col-5 text-center">
                <strong>
                    ${partido.visitante}
                </strong>
            </div>

        </div>
    `;

    filasSets += crearFilaSet(
        partido,
        idPartido,
        0,
        resultado.sets[0]
    );

    filasSets += crearFilaSet(
        partido,
        idPartido,
        1,
        resultado.sets[1]
    );

    if (resumen.usaTercerSet) {
        filasSets += `
            <div class="alert alert-warning py-2 small mt-3 mb-3">
                Empate 1-1 en sets. Se juega el Set 3.
            </div>
        `;

        filasSets += crearFilaSet(
            partido,
            idPartido,
            2,
            resultado.sets[2]
        );
    }

    let tituloExtra = "";

    if (tipo === "semifinal") {
        tituloExtra = `
            <div class="badge bg-dark mb-3">
                SEMIFINAL
            </div>
        `;
    }

    if (tipo === "final") {
        tituloExtra = `
            <div class="badge bg-warning text-dark mb-3">
                FINAL
            </div>
        `;
    }

    const puntosTexto =
        resumen.usaTercerSet
            ? "Resultado 2-1: ganador 2 puntos · perdedor 1 punto"
            : "Resultado 2-0: ganador 3 puntos · perdedor 0 puntos";

    const columna =
        document.createElement("div");

    columna.className =
        tipo === "final"
            ? "col-lg-8"
            : "col-lg-6";

    columna.innerHTML = `
        <div class="partido">

            ${tituloExtra}

            <div class="estado-partido">
                ${
                    resumen.partidoCompleto
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

            <div class="mb-2 fw-bold">
                Goles por set
            </div>

            ${filasSets}

            <div class="mt-3 small">

                <strong>Sets:</strong>
                ${resumen.setsLocal}
                -
                ${resumen.setsVisitante}

                &nbsp;·&nbsp;

                <strong>Goles:</strong>
                ${resumen.golesLocal}
                -
                ${resumen.golesVisitante}

            </div>

            <div class="mt-2 text-muted small">
                ${puntosTexto}
            </div>

        </div>
    `;

    return columna;
}

function limitarValorInput(input) {
    if (input.value === "") {
        return;
    }

    let valor =
        Number(input.value);

    if (!Number.isFinite(valor)) {
        input.value = "";
        return;
    }

    valor =
        Math.trunc(valor);

    if (valor < 0) {
        valor = 0;
    }

    if (valor > 17) {
        valor = 17;
    }

    input.value =
        valor;
}

function agregarEventosResultados() {
    const inputs =
        document.querySelectorAll(
            ".gol-set"
        );

    inputs.forEach(input => {
        input.addEventListener(
            "input",
            function () {
                limitarValorInput(this);
            }
        );

        input.addEventListener(
            "change",
            function () {
                limitarValorInput(this);

                const id =
                    this.dataset.id;

                const indiceSet =
                    Number(
                        this.dataset.set
                    );

                const equipo =
                    this.dataset.equipo;

                if (!resultados[id]) {
                    resultados[id] =
                        crearResultadoVacio();
                }

                resultados[id] =
                    normalizarResultado(
                        resultados[id]
                    );

                resultados[id]
                    .sets[indiceSet][equipo] =
                    this.value === ""
                        ? ""
                        : Number(this.value);

                if (
                    indiceSet < 2 &&
                    setCompleto(
                        resultados[id].sets[0].local,
                        resultados[id].sets[0].visitante
                    ) &&
                    setCompleto(
                        resultados[id].sets[1].local,
                        resultados[id].sets[1].visitante
                    ) &&
                    !necesitaTercerSet(
                        resultados[id]
                    )
                ) {
                    resultados[id].sets[2] = {
                        local: "",
                        visitante: ""
                    };
                }

                guardarResultados();

                if (
                    modalidad === "liga"
                ) {
                    calcularTablaLiga();
                    actualizarPartidosCargadosLiga();
                    mostrarFecha();
                } else {
                    mostrarCopa();
                }
            }
        );
    });
}

function iniciarTorneo() {
    seccionConfiguracion.classList.add(
        "d-none"
    );

    seccionTorneo.classList.remove(
        "d-none"
    );

    btnReset.classList.remove(
        "d-none"
    );

    if (btnDescargarImagen) {
        btnDescargarImagen.classList.remove(
            "d-none"
        );
    }

    document.getElementById(
        "totalEquipos"
    ).textContent =
        equipos.length;

    if (modalidad === "liga") {
        modoLiga.classList.remove(
            "d-none"
        );

        modoCopa.classList.add(
            "d-none"
        );

        fixture =
            generarFixture(equipos);

        mostrarLiga();
    } else {
        modoLiga.classList.add(
            "d-none"
        );

        modoCopa.classList.remove(
            "d-none"
        );

        dividirGrupos();

        mostrarCopa();
    }
}

function mostrarLiga() {
    let totalPartidos = 0;

    fixture.forEach(fecha => {
        totalPartidos +=
            fecha.partidos.length;
    });

    document.getElementById(
        "totalFechas"
    ).textContent =
        fixture.length;

    document.getElementById(
        "labelFechas"
    ).textContent =
        "Fechas";

    document.getElementById(
        "totalPartidos"
    ).textContent =
        totalPartidos;

    mostrarFecha();
    calcularTablaLiga();
    actualizarPartidosCargadosLiga();
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

    if (datosFecha.libre) {
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
            const id =
                `L-${fechaActual}-${indice}`;

            contenedor.appendChild(
                crearTarjetaPartido(
                    partido,
                    id
                )
            );
        }
    );

    agregarEventosResultados();

    actualizarBotonesFechas();
}

function calcularTablaLiga() {
    const tabla = {};

    equipos.forEach(equipo => {
        tabla[equipo] = {
            equipo,
            puntos: 0,
            goles: 0
        };
    });

    fixture.forEach(
        (datosFecha, numeroFecha) => {
            datosFecha.partidos.forEach(
                (partido, indice) => {
                    const id =
                        `L-${numeroFecha}-${indice}`;

                    const resultado =
                        resultados[id];

                    if (!resultado) {
                        return;
                    }

                    const resumen =
                        calcularResultadoPartido(
                            resultado
                        );

                    tabla[
                        partido.local
                    ].goles +=
                        resumen.golesLocal;

                    tabla[
                        partido.visitante
                    ].goles +=
                        resumen.golesVisitante;

                    if (
                        !resumen.partidoCompleto
                    ) {
                        return;
                    }

                    tabla[
                        partido.local
                    ].puntos +=
                        resumen.puntosLocal;

                    tabla[
                        partido.visitante
                    ].puntos +=
                        resumen.puntosVisitante;
                }
            );
        }
    );

    tablaActualLiga =
        ordenarTabla(
            Object.values(tabla)
        );

    mostrarTabla(
        tablaActualLiga,
        document.getElementById(
            "tablaPosiciones"
        )
    );
}

function calcularTablaGrupo(
    equiposGrupo,
    partidos,
    prefijo
) {
    const tabla = {};

    equiposGrupo.forEach(equipo => {
        tabla[equipo] = {
            equipo,
            puntos: 0,
            goles: 0
        };
    });

    partidos.forEach(
        (partido, indice) => {
            const id =
                `${prefijo}-${indice}`;

            const resultado =
                resultados[id];

            if (!resultado) {
                return;
            }

            const resumen =
                calcularResultadoPartido(
                    resultado
                );

            tabla[
                partido.local
            ].goles +=
                resumen.golesLocal;

            tabla[
                partido.visitante
            ].goles +=
                resumen.golesVisitante;

            if (
                !resumen.partidoCompleto
            ) {
                return;
            }

            tabla[
                partido.local
            ].puntos +=
                resumen.puntosLocal;

            tabla[
                partido.visitante
            ].puntos +=
                resumen.puntosVisitante;
        }
    );

    return ordenarTabla(
        Object.values(tabla)
    );
}

function ordenarTabla(tabla) {
    return tabla.sort(
        (a, b) => {
            if (
                b.puntos !==
                a.puntos
            ) {
                return (
                    b.puntos -
                    a.puntos
                );
            }

            return (
                b.goles -
                a.goles
            );
        }
    );
}

function mostrarTabla(
    posiciones,
    tbody
) {
    tbody.innerHTML = "";

    posiciones.forEach(
        (equipo, indice) => {
            const fila =
                document.createElement(
                    "tr"
                );

            if (indice < 2) {
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

                <td>
                    ${equipo.goles}
                </td>
            `;

            tbody.appendChild(
                fila
            );
        }
    );
}

function mostrarPartidosGrupo(
    partidos,
    prefijo,
    contenedor
) {
    contenedor.innerHTML = "";

    partidos.forEach(
        (partido, indice) => {
            const id =
                `${prefijo}-${indice}`;

            contenedor.appendChild(
                crearTarjetaPartido(
                    partido,
                    id
                )
            );
        }
    );
}

function grupoCompleto(
    partidos,
    prefijo
) {
    return partidos.every(
        (partido, indice) => {
            const resultado =
                resultados[
                    `${prefijo}-${indice}`
                ];

            if (!resultado) {
                return false;
            }

            return calcularResultadoPartido(
                resultado
            ).partidoCompleto;
        }
    );
}

function gruposCompletos() {
    return (
        grupoCompleto(
            fixtureA,
            "A"
        ) &&
        grupoCompleto(
            fixtureB,
            "B"
        )
    );
}

function mostrarCopa() {
    tablaActualA =
        calcularTablaGrupo(
            grupoA,
            fixtureA,
            "A"
        );

    tablaActualB =
        calcularTablaGrupo(
            grupoB,
            fixtureB,
            "B"
        );

    mostrarTabla(
        tablaActualA,
        document.getElementById(
            "tablaGrupoA"
        )
    );

    mostrarTabla(
        tablaActualB,
        document.getElementById(
            "tablaGrupoB"
        )
    );

    mostrarPartidosGrupo(
        fixtureA,
        "A",
        document.getElementById(
            "partidosGrupoA"
        )
    );

    mostrarPartidosGrupo(
        fixtureB,
        "B",
        document.getElementById(
            "partidosGrupoB"
        )
    );

    actualizarCopa();

    agregarEventosResultados();
}

function actualizarCopa() {
    const totalPartidosGrupos =
        fixtureA.length +
        fixtureB.length;

    document.getElementById(
        "totalFechas"
    ).textContent =
        "2";

    document.getElementById(
        "labelFechas"
    ).textContent =
        "Grupos";

    document.getElementById(
        "totalPartidos"
    ).textContent =
        totalPartidosGrupos + 3;

    actualizarPartidosCargadosCopa();

    if (!gruposCompletos()) {
        document.getElementById(
            "mensajeClasificados"
        ).classList.remove(
            "d-none"
        );

        document.getElementById(
            "clasificados"
        ).innerHTML = "";

        document.getElementById(
            "seccionSemifinales"
        ).classList.add(
            "d-none"
        );

        document.getElementById(
            "seccionFinal"
        ).classList.add(
            "d-none"
        );

        document.getElementById(
            "seccionCampeon"
        ).classList.add(
            "d-none"
        );

        return;
    }

    mostrarClasificados();
    mostrarSemifinales();
}

function mostrarClasificados() {
    document.getElementById(
        "mensajeClasificados"
    ).classList.add(
        "d-none"
    );

    const clasificados =
        document.getElementById(
            "clasificados"
        );

    clasificados.innerHTML = `
        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center">
                <div class="card-body">
                    <small class="text-muted">
                        1° GRUPO A
                    </small>

                    <h5 class="mt-2">
                        ${tablaActualA[0].equipo}
                    </h5>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center">
                <div class="card-body">
                    <small class="text-muted">
                        2° GRUPO A
                    </small>

                    <h5 class="mt-2">
                        ${tablaActualA[1].equipo}
                    </h5>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center">
                <div class="card-body">
                    <small class="text-muted">
                        1° GRUPO B
                    </small>

                    <h5 class="mt-2">
                        ${tablaActualB[0].equipo}
                    </h5>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center">
                <div class="card-body">
                    <small class="text-muted">
                        2° GRUPO B
                    </small>

                    <h5 class="mt-2">
                        ${tablaActualB[1].equipo}
                    </h5>
                </div>
            </div>
        </div>
    `;
}

function obtenerSemifinales() {
    return [
        {
            local:
                tablaActualA[0].equipo,

            visitante:
                tablaActualB[1].equipo
        },
        {
            local:
                tablaActualB[0].equipo,

            visitante:
                tablaActualA[1].equipo
        }
    ];
}

function mostrarSemifinales() {
    const seccion =
        document.getElementById(
            "seccionSemifinales"
        );

    const contenedor =
        document.getElementById(
            "partidosSemifinal"
        );

    seccion.classList.remove(
        "d-none"
    );

    contenedor.innerHTML = "";

    const semifinales =
        obtenerSemifinales();

    semifinales.forEach(
        (partido, indice) => {
            contenedor.appendChild(
                crearTarjetaPartido(
                    partido,
                    `SF-${indice}`,
                    "semifinal"
                )
            );
        }
    );

    const resultado1 =
        resultados["SF-0"];

    const resultado2 =
        resultados["SF-1"];

    const completa1 =
        resultado1 &&
        calcularResultadoPartido(
            resultado1
        ).partidoCompleto;

    const completa2 =
        resultado2 &&
        calcularResultadoPartido(
            resultado2
        ).partidoCompleto;

    if (
        completa1 &&
        completa2
    ) {
        mostrarFinal(
            semifinales
        );
    } else {
        document.getElementById(
            "seccionFinal"
        ).classList.add(
            "d-none"
        );

        document.getElementById(
            "seccionCampeon"
        ).classList.add(
            "d-none"
        );
    }
}

function mostrarFinal(semifinales) {
    const ganador1 =
        obtenerGanador(
            semifinales[0],
            resultados["SF-0"]
        );

    const ganador2 =
        obtenerGanador(
            semifinales[1],
            resultados["SF-1"]
        );

    if (
        !ganador1 ||
        !ganador2
    ) {
        return;
    }

    const partido = {
        local: ganador1,
        visitante: ganador2
    };

    const seccion =
        document.getElementById(
            "seccionFinal"
        );

    const contenedor =
        document.getElementById(
            "partidoFinal"
        );

    seccion.classList.remove(
        "d-none"
    );

    contenedor.innerHTML = "";

    contenedor.appendChild(
        crearTarjetaPartido(
            partido,
            "F-0",
            "final"
        )
    );

    const resultadoFinal =
        resultados["F-0"];

    if (
        resultadoFinal &&
        calcularResultadoPartido(
            resultadoFinal
        ).partidoCompleto
    ) {
        const campeon =
            obtenerGanador(
                partido,
                resultadoFinal
            );

        if (campeon) {
            document.getElementById(
                "seccionCampeon"
            ).classList.remove(
                "d-none"
            );

            document.getElementById(
                "nombreCampeon"
            ).textContent =
                campeon;
        }
    } else {
        document.getElementById(
            "seccionCampeon"
        ).classList.add(
            "d-none"
        );
    }
}

function actualizarPartidosCargadosLiga() {
    let cantidad = 0;

    fixture.forEach(
        (datosFecha, numeroFecha) => {
            datosFecha.partidos.forEach(
                (partido, indice) => {
                    const resultado =
                        resultados[
                            `L-${numeroFecha}-${indice}`
                        ];

                    if (
                        resultado &&
                        calcularResultadoPartido(
                            resultado
                        ).partidoCompleto
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

function actualizarPartidosCargadosCopa() {
    let cantidad = 0;

    const idsGrupos = [];

    fixtureA.forEach(
        (partido, indice) => {
            idsGrupos.push(
                `A-${indice}`
            );
        }
    );

    fixtureB.forEach(
        (partido, indice) => {
            idsGrupos.push(
                `B-${indice}`
            );
        }
    );

    idsGrupos.forEach(id => {
        if (
            resultados[id] &&
            calcularResultadoPartido(
                resultados[id]
            ).partidoCompleto
        ) {
            cantidad++;
        }
    });

    [
        "SF-0",
        "SF-1",
        "F-0"
    ].forEach(id => {
        if (
            resultados[id] &&
            calcularResultadoPartido(
                resultados[id]
            ).partidoCompleto
        ) {
            cantidad++;
        }
    });

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
        if (fechaActual > 0) {
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
    document.getElementById(
        "fechaAnterior"
    ).disabled =
        fechaActual === 0;

    document.getElementById(
        "fechaSiguiente"
    ).disabled =
        fechaActual ===
        fixture.length - 1;
}

function descargarImagenTorneo() {
    if (modalidad === "liga") {
        descargarImagenLiga();
    } else {
        descargarImagenCopa();
    }
}

function descargarImagenLiga() {
    calcularTablaLiga();

    const partidos = [];

    fixture.forEach(
        (fecha, numeroFecha) => {
            fecha.partidos.forEach(
                (partido, indice) => {
                    partidos.push({
                        partido,
                        id:
                            `L-${numeroFecha}-${indice}`,
                        fecha:
                            numeroFecha + 1
                    });
                }
            );
        }
    );

    const ancho = 1400;
    const altoFila = 48;
    const altoPartido = 115;

    const alto =
        270 +
        tablaActualLiga.length *
            altoFila +
        partidos.length *
            (altoPartido + 18) +
        300;

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = ancho;
    canvas.height = alto;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );

    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.font = "bold 42px Arial";

    ctx.fillText(
        "Liga de Equipos - Newcom",
        ancho / 2,
        60
    );

    ctx.font = "22px Arial";
    ctx.fillStyle = "#6b7280";

    ctx.fillText(
        "Tabla general y enfrentamientos",
        ancho / 2,
        100
    );

    let y = 150;

    dibujarTituloSeccion(
        ctx,
        "TABLA GENERAL",
        ancho / 2,
        y
    );

    y += 45;

    dibujarTablaCanvas(
        ctx,
        tablaActualLiga,
        200,
        y,
        1000,
        ""
    );

    y +=
        tablaActualLiga.length *
            altoFila +
        100;

    dibujarTituloSeccion(
        ctx,
        "ENFRENTAMIENTOS",
        ancho / 2,
        y
    );

    y += 50;

    partidos.forEach(item => {
        ctx.fillStyle =
            "#6b7280";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            `Fecha ${item.fecha}`,
            50,
            y + 18
        );

        y += 28;

        y =
            dibujarUnPartidoCanvas(
                ctx,
                item.partido,
                resultados[
                    item.id
                ],
                50,
                y,
                ancho - 100
            );

        y += 15;
    });

    descargarCanvas(
        canvas
    );
}

function descargarImagenCopa() {
    tablaActualA =
        calcularTablaGrupo(
            grupoA,
            fixtureA,
            "A"
        );

    tablaActualB =
        calcularTablaGrupo(
            grupoB,
            fixtureB,
            "B"
        );

    const ancho = 1400;
    const margen = 50;
    const altoFila = 48;
    const altoPartido = 115;

    const cantidadPartidos =
        fixtureA.length +
        fixtureB.length +
        3;

    const alto =
        450 +
        Math.max(
            tablaActualA.length,
            tablaActualB.length
        ) *
            altoFila +
        cantidadPartidos *
            (altoPartido + 20) +
        700;

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = ancho;
    canvas.height = alto;

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );

    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.font = "bold 42px Arial";

    ctx.fillText(
        "Liga de Equipos - Newcom",
        ancho / 2,
        60
    );

    ctx.font = "22px Arial";
    ctx.fillStyle = "#6b7280";

    ctx.fillText(
        "Grupos y enfrentamientos",
        ancho / 2,
        100
    );

    let y = 150;

    dibujarTituloSeccion(
        ctx,
        "TABLAS",
        ancho / 2,
        y
    );

    y += 50;

    const anchoTabla = 600;

    dibujarTablaCanvas(
        ctx,
        tablaActualA,
        margen,
        y,
        anchoTabla,
        "GRUPO A"
    );

    dibujarTablaCanvas(
        ctx,
        tablaActualB,
        ancho -
            margen -
            anchoTabla,
        y,
        anchoTabla,
        "GRUPO B"
    );

    y +=
        Math.max(
            tablaActualA.length,
            tablaActualB.length
        ) *
            altoFila +
        150;

    dibujarTituloSeccion(
        ctx,
        "ENFRENTAMIENTOS GRUPO A",
        ancho / 2,
        y
    );

    y += 50;

    y =
        dibujarPartidosCanvas(
            ctx,
            fixtureA,
            "A",
            margen,
            y,
            ancho -
                margen * 2
        );

    y += 40;

    dibujarTituloSeccion(
        ctx,
        "ENFRENTAMIENTOS GRUPO B",
        ancho / 2,
        y
    );

    y += 50;

    y =
        dibujarPartidosCanvas(
            ctx,
            fixtureB,
            "B",
            margen,
            y,
            ancho -
                margen * 2
        );

    if (gruposCompletos()) {
        y += 40;

        dibujarTituloSeccion(
            ctx,
            "SEMIFINALES",
            ancho / 2,
            y
        );

        y += 50;

        const semifinales =
            obtenerSemifinales();

        y =
            dibujarPartidosEliminatoriaCanvas(
                ctx,
                semifinales,
                [
                    "SF-0",
                    "SF-1"
                ],
                margen,
                y,
                ancho -
                    margen * 2
            );

        const ganador1 =
            resultados["SF-0"]
                ? obtenerGanador(
                    semifinales[0],
                    resultados["SF-0"]
                )
                : null;

        const ganador2 =
            resultados["SF-1"]
                ? obtenerGanador(
                    semifinales[1],
                    resultados["SF-1"]
                )
                : null;

        if (
            ganador1 &&
            ganador2
        ) {
            y += 40;

            dibujarTituloSeccion(
                ctx,
                "FINAL",
                ancho / 2,
                y
            );

            y += 50;

            const final = [
                {
                    local:
                        ganador1,
                    visitante:
                        ganador2
                }
            ];

            y =
                dibujarPartidosEliminatoriaCanvas(
                    ctx,
                    final,
                    ["F-0"],
                    margen,
                    y,
                    ancho -
                        margen * 2
                );
        }
    }

    descargarCanvas(
        canvas
    );
}

function dibujarTituloSeccion(
    ctx,
    texto,
    x,
    y
) {
    ctx.fillStyle =
        "#198754";

    ctx.font =
        "bold 28px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        texto,
        x,
        y
    );
}

function dibujarTablaCanvas(
    ctx,
    tabla,
    x,
    y,
    ancho,
    titulo
) {
    const altoFila = 48;

    if (titulo) {
        ctx.fillStyle =
            "#111827";

        ctx.font =
            "bold 24px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            titulo,
            x +
                ancho / 2,
            y
        );

        y += 25;
    }

    ctx.fillStyle =
        "#198754";

    ctx.fillRect(
        x,
        y,
        ancho,
        altoFila
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 17px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "POS",
        x + 20,
        y + 31
    );

    ctx.fillText(
        "EQUIPO",
        x + 90,
        y + 31
    );

    ctx.fillText(
        "PTS",
        x +
            ancho -
            150,
        y + 31
    );

    ctx.fillText(
        "GOLES",
        x +
            ancho -
            80,
        y + 31
    );

    tabla.forEach(
        (equipo, indice) => {
            const filaY =
                y +
                altoFila +
                indice *
                    altoFila;

            ctx.fillStyle =
                indice % 2 === 0
                    ? "#f3f4f6"
                    : "#ffffff";

            ctx.fillRect(
                x,
                filaY,
                ancho,
                altoFila
            );

            ctx.strokeStyle =
                "#e5e7eb";

            ctx.strokeRect(
                x,
                filaY,
                ancho,
                altoFila
            );

            ctx.fillStyle =
                "#111827";

            ctx.font =
                "17px Arial";

            ctx.textAlign =
                "left";

            ctx.fillText(
                indice + 1,
                x + 25,
                filaY + 31
            );

            ctx.font =
                "bold 17px Arial";

            ctx.fillText(
                equipo.equipo,
                x + 90,
                filaY + 31
            );

            ctx.font =
                "17px Arial";

            ctx.fillText(
                equipo.puntos,
                x +
                    ancho -
                    140,
                filaY + 31
            );

            ctx.fillText(
                equipo.goles,
                x +
                    ancho -
                    65,
                filaY + 31
            );
        }
    );
}

function dibujarPartidosCanvas(
    ctx,
    partidos,
    prefijo,
    x,
    y,
    ancho
) {
    partidos.forEach(
        (partido, indice) => {
            const id =
                `${prefijo}-${indice}`;

            y =
                dibujarUnPartidoCanvas(
                    ctx,
                    partido,
                    resultados[id],
                    x,
                    y,
                    ancho
                );

            y += 18;
        }
    );

    return y;
}

function dibujarPartidosEliminatoriaCanvas(
    ctx,
    partidos,
    ids,
    x,
    y,
    ancho
) {
    partidos.forEach(
        (partido, indice) => {
            y =
                dibujarUnPartidoCanvas(
                    ctx,
                    partido,
                    resultados[
                        ids[indice]
                    ],
                    x,
                    y,
                    ancho
                );

            y += 18;
        }
    );

    return y;
}

function dibujarUnPartidoCanvas(
    ctx,
    partido,
    resultado,
    x,
    y,
    ancho
) {
    const alto = 110;

    ctx.fillStyle =
        "#f8f9fa";

    ctx.fillRect(
        x,
        y,
        ancho,
        alto
    );

    ctx.strokeStyle =
        "#d1d5db";

    ctx.strokeRect(
        x,
        y,
        ancho,
        alto
    );

    ctx.fillStyle =
        "#111827";

    ctx.font =
        "bold 20px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        `${partido.local}  vs  ${partido.visitante}`,
        x +
            ancho / 2,
        y + 28
    );

    if (!resultado) {
        ctx.fillStyle =
            "#6b7280";

        ctx.font =
            "16px Arial";

        ctx.fillText(
            "Pendiente",
            x +
                ancho / 2,
            y + 65
        );

        return y + alto;
    }

    const datos =
        normalizarResultado(
            resultado
        );

    const resumen =
        calcularResultadoPartido(
            resultado
        );

    let textoSets = "";

    datos.sets.forEach(
        (set, indiceSet) => {
            if (
                set.local !== "" &&
                set.visitante !== ""
            ) {
                if (
                    textoSets !== ""
                ) {
                    textoSets +=
                        "   |   ";
                }

                textoSets +=
                    `Set ${indiceSet + 1}: ${set.local}-${set.visitante}`;
            }
        }
    );

    ctx.fillStyle =
        "#374151";

    ctx.font =
        "16px Arial";

    ctx.fillText(
        textoSets || "Pendiente",
        x +
            ancho / 2,
        y + 58
    );

    ctx.fillStyle =
        "#111827";

    ctx.font =
        "bold 16px Arial";

    ctx.fillText(
        `Sets: ${resumen.setsLocal}-${resumen.setsVisitante}   |   Goles: ${resumen.golesLocal}-${resumen.golesVisitante}`,
        x +
            ancho / 2,
        y + 86
    );

    return y + alto;
}

async function descargarCanvas(canvas) {
    const fecha =
        new Date()
            .toLocaleDateString("es-UY")
            .replaceAll("/", "-");

    const nombreArchivo =
        `tablilla-newcom-${fecha}.png`;

    const dataUrl =
        canvas.toDataURL("image/png");

    const base64 =
        dataUrl.split(",")[1];

    const esAppNativa =
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform();

    if (esAppNativa) {
        try {
            const plugins =
                window.Capacitor.Plugins;

            if (
                !plugins ||
                !plugins.Filesystem
            ) {
                throw new Error(
                    "Filesystem no está disponible."
                );
            }

            const Filesystem =
                plugins.Filesystem;

            await Filesystem.writeFile({
                path:
                    nombreArchivo,

                data:
                    base64,

                directory:
                    "DOCUMENTS"
            });

            alert(
                `Tablilla guardada correctamente en Documentos como ${nombreArchivo}`
            );

            return;

        } catch (error) {
            console.error(
                "Error al guardar la tablilla:",
                error
            );

            alert(
                "No se pudo guardar la tablilla en el teléfono."
            );

            return;
        }
    }

    const enlace =
        document.createElement(
            "a"
        );

    enlace.href =
        dataUrl;

    enlace.download =
        nombreArchivo;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    document.body.removeChild(
        enlace
    );
}

if (btnDescargarImagen) {
    btnDescargarImagen.addEventListener(
        "click",
        descargarImagenTorneo
    );
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

        localStorage.removeItem(
            "modalidadLiga"
        );

        equipos = [];
        resultados = {};
        torneoGenerado = false;
        modalidad = "liga";
        fechaActual = 0;

        fixture = [];

        grupoA = [];
        grupoB = [];

        fixtureA = [];
        fixtureB = [];

        tablaActualA = [];
        tablaActualB = [];
        tablaActualLiga = [];

        seccionTorneo.classList.add(
            "d-none"
        );

        seccionConfiguracion.classList.remove(
            "d-none"
        );

        btnReset.classList.add(
            "d-none"
        );

        if (btnDescargarImagen) {
            btnDescargarImagen.classList.add(
                "d-none"
            );
        }

        modalidadTorneo.value =
            "liga";

        nombreEquipo.value =
            "";

        mostrarEquiposConfiguracion();

        actualizarAyudaModalidad();
    }
);

function iniciarPagina() {
    modalidadTorneo.value =
        modalidad;

    actualizarAyudaModalidad();

    if (
        torneoGenerado &&
        equipos.length >= 2
    ) {
        if (
            modalidad === "copa" &&
            (
                equipos.length < 4 ||
                equipos.length % 2 !== 0
            )
        ) {
            torneoGenerado = false;

            localStorage.setItem(
                "torneoGenerado",
                JSON.stringify(false)
            );

            mostrarEquiposConfiguracion();

            return;
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

        if (btnDescargarImagen) {
            btnDescargarImagen.classList.add(
                "d-none"
            );
        }
    }
}

iniciarPagina();