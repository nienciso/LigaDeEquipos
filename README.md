# LigaDeEquipos

Sistema web de gestión de torneos.

El proyecto permite crear dinámicamente un campeonato de tipo todos contra todos, ingresando los equipos participantes y generando automáticamente las fechas y enfrentamientos necesarios para que cada equipo se enfrente todos contra todos.

Para resolver la generación de partidos se implementó en JavaScript un sistema de rotación de equipos, contemplando tanto cantidades pares como impares de participantes. En caso de existir una cantidad impar, el sistema asigna automáticamente un equipo libre por fecha.

Los resultados se registran seleccionando victoria, empate o derrota. A partir de estos datos, la aplicación calcula automáticamente la puntuación general aplicando el sistema de 3 puntos por victoria, 1 por empate y 0 por derrota, ordenando la clasificación de mayor a menor puntaje.

Se utilizó LocalStorage para mantener los equipos, resultados, fecha actual y estado del torneo almacenados en el navegador, evitando la necesidad de implementar una base de datos para esta versión.

La interfaz fue desarrollada con HTML5, CSS3 y Bootstrap, mientras que JavaScript se encarga de la generación dinámica del torneo, manipulación del DOM, gestión de resultados, cálculo de posiciones y persistencia de datos.

Tecnologías utilizadas: HTML5 - CSS - Bootstrap - JavaScript 

El proyecto aplica conceptos como manipulación del DOM, arrays, objetos, funciones, eventos, ordenamiento de datos, almacenamiento local y generación dinámica de contenido.
