# Kotodama 言霊 — App móvil para aprender japonés de supervivencia

> **Instrucciones para Claude Code.** Lee este documento entero antes de escribir código. Es la especificación completa del proyecto. Empieza por la sección 19 («Cómo quiero que trabajes») y sigue las fases de la sección 17 en orden.

---

## 1. Contexto y objetivo

Soy hispanohablante, viajo a Japón **del 2 al 16 de noviembre de 2026** y entreno desde el **3 de octubre hasta el 1 de noviembre**. Quiero una app para el móvil que funcione **como Duolingo**: lecciones cortas, camino de unidades, experiencia, racha, vidas y repasos. Me servirá para estudiar las cuatro semanas y luego como chuleta durante el viaje.

El objetivo no es aprobar un examen, sino **sobrevivir en situaciones reales**: saludar, pedir mesa, pedir la cuenta, pedir salsa de soja o un tenedor, pagar en un konbini, hacer el check-in, preguntar por una estación y entender lo que me van a decir.

Ya tengo un dossier impreso con este mismo plan (4 regiones). **La app debe seguir exactamente el mismo contenido y la misma estructura** (sección 10), para que app y papel se refuercen.

- **Nombre de la app:** Kotodama (言霊). Es el concepto japonés del «poder mágico que vive en las palabras», que encaja con la idea de aprender «hechizos cotidianos».
- **Idioma de la interfaz:** español de España, tuteando.
- **Idioma del código:** identificadores, comentarios y commits en inglés.

---

## 2. Decisión técnica: PWA instalable

Construye una **Progressive Web App** con un único código, instalable en iPhone y Android desde el navegador («Añadir a pantalla de inicio»). Debe funcionar **100 % offline** y no tener backend.

Motivos: no requiere App Store ni Google Play, se despliega gratis, funciona sin conexión durante el viaje y se puede desarrollar y probar rápido. Tenemos menos de cuatro semanas.

**Stack obligatorio:**

| Pieza | Elección |
|---|---|
| Build | Vite + React 18 + TypeScript (modo `strict`) |
| Estilos | Tailwind CSS con los tokens de la sección 3 como variables CSS (`--color-…`) mapeadas en `tailwind.config` |
| Estado | Zustand con middleware `persist` (localStorage, con `version` y `migrate`) |
| PWA | `vite-plugin-pwa` (Workbox): precache de todo, incluidas las fuentes |
| Animación | `motion` (Framer Motion), respetando `prefers-reduced-motion` |
| Kana/romaji | `wanakana` para convertir y normalizar entradas |
| Fuentes | `@fontsource/*` (autoalojadas, nada de llamadas a Google Fonts en tiempo de ejecución) |
| Router | `react-router-dom` con `HashRouter` (compatible con GitHub Pages) |
| Tests | Vitest + Testing Library. Playwright opcional para un smoke test en viewport 390×844 |
| Audio de voz | Web Speech API (`speechSynthesis`) con voz `ja-JP` |
| Efectos de sonido | Web Audio API, sintetizados en código (sin archivos de audio de terceros) |
| Despliegue | GitHub Pages mediante GitHub Actions |

**No uses:** backend, bases de datos remotas, autenticación, analítica, anuncios, claves de API ni notificaciones push (en v1).

---

## 3. Identidad visual: «bosque con magia»

La dirección estética es **un bosque antiguo de aventura** (verdes profundos, musgo, piedra, luz filtrada entre hojas) **atravesado por magia serena**: círculos de hechizo, destellos violeta y cian, campos de flores que brotan. La sensación es la de un diario de viaje de un mago en un bosque: tranquila, nada estridente ni infantil.

### 3.1 Propiedad intelectual: solo inspiración

Es una app personal, pero la quiero limpia:

- **Prohibido:** personajes, logos, la Trifuerza, sprites, iconos, música, efectos de sonido, tipografías oficiales o capturas de *The Legend of Zelda*, de Nintendo o de *Frieren*. Tampoco elfos magos con coletas ni hojas parlantes que recuerden a personajes conocidos.
- **Permitido:** la paleta y la atmósfera («bosque de aventura», «magia tranquila»), y nombres propios como **palabras de vocabulario en katakana** (ゼルダ, フリーレン, ハイラル…), tratados como texto normal en los ejercicios. Nunca como marca ni con imágenes.
- Todo el arte (mascota, mapa, círculos mágicos) debe ser **original**, hecho en SVG o CSS en el propio proyecto.

### 3.2 Paleta (tokens)

**Modo día, «Bosque al amanecer»:**

| Token | Hex | Uso |
|---|---|---|
| `forest-900` | `#0E2419` | Texto principal, cabeceras oscuras |
| `forest-700` | `#1D5C48` | Color primario: botones, camino del mapa, barra de progreso |
| `moss-500` | `#5E8C3A` | Estados de acierto, nodos completados |
| `leaf-300` | `#A7C66B` | Resaltes suaves, brillo de nodos activos |
| `mist-50` | `#E9F0E6` | Fondo general (niebla verde pálida, **no** crema) |
| `parchment-100` | `#F3EAD3` | **Solo** para las tarjetas del Grimorio (frases) |
| `bark-600` | `#6B4F35` | Bordes de tarjetas de pergamino, detalles de madera |
| `rune-gold` | `#C9A13B` | Experiencia, logros, la racha |
| `mana-500` | `#7C6CE0` | Magia: círculo de hechizo, maná, repasos |
| `spell-glow` | `#9FF0E4` | Destellos y brillo del círculo de hechizo |
| `ember-500` | `#C2493B` | Error y vidas perdidas |

**Modo noche, «Bosque bajo las estrellas»** (automático según el sistema y conmutable en Ajustes): fondo `#0E2419`, superficie `#163628`, superficie elevada `#1F4433`, texto `#E9F0E6`, texto secundario `#A9BFB2`. El primario pasa a `leaf-300` y la magia brilla más (`spell-glow` con `filter: drop-shadow`).

**Color por región**, el mismo que en el dossier impreso, usado en el estandarte de cada región del mapa y en la cabecera de sus lecciones:

| Región | Color | Ambiente |
|---|---|---|
| R0 Campamento | `#6B5A2A` | Hoguera, tierra |
| R1 El pueblo inicial | `#1D5C48` | Pradera verde |
| R2 La taberna | `#7A3B2E` | Farolillos ámbar, madera |
| R3 El mercado | `#4F3F86` | Atardecer violeta |
| R4 El gran viaje | `#2B4F72` | Noche azul con estrellas |

El contraste de todos los textos debe ser **AA** como mínimo. Compruébalo.

### 3.3 Tipografía

- **Títulos y nombres de región:** `Shippori Mincho B1` (serif japonesa con glifos latinos). Aporta el aire de grimorio.
- **Interfaz y texto:** `Nunito` para el latín y `M PLUS Rounded 1c` para el japonés de interfaz. Ambas redondeadas, amables y muy legibles en móvil.
- **Kana y frases que se aprenden:** `Klee One`. Imita la escritura a lápiz y muestra la forma correcta de los trazos (algo importante para aprender kana).

Escala de tamaños (rem): 0.8125 · 0.9375 · 1.0625 · 1.25 · 1.5 · 2 · 3. El kana en las tarjetas de ejercicio debe ser **grande** (2–3 rem; el kana aislado, 4.5 rem). Texto de interfaz en *sentence case*. Nada de mayúsculas sostenidas en etiquetas.

### 3.4 Elemento estrella: el círculo de hechizo

**Gasta la audacia visual aquí y deja el resto sobrio.**

- Al **acertar**, detrás del botón «Continuar» florece un **círculo mágico original** en SVG: 3 anillos concéntricos, uno de ellos formado por kana diminutos de la frase que acabas de acertar, girando despacio. Lo acompaña un destello `spell-glow` y 6–10 pétalos o hojas que se dispersan. Dura unos 900 ms.
- Al **terminar una lección**, el círculo se completa y aparece el texto «Hechizo aprendido».
- Al **superar al guardián de una región**, en el mapa **brota un campo de flores** a lo largo del tramo de esa región (flores SVG originales que nacen escalonadas). Es el gran momento de recompensa.
- Con `prefers-reduced-motion`, todo se sustituye por un fundido simple.

Fuera de estos momentos, **nada de animaciones decorativas**: ni entradas de tarjetas en cascada ni hovers en todo. El movimiento solo responde a acciones del usuario.

### 3.5 Mascota: Fuku, el búho guía

Un **búho pequeño y redondo** (ふくろう, *fukurō*) con una capa de musgo cerrada con un broche de hoja y un farolillo diminuto. Es un diseño original, simple y geométrico, en SVG.

En Japón el búho da suerte por un juego de palabras: ふくろう suena como 不苦労, «sin penurias». Explícalo en el onboarding: es una píldora cultural.

Necesita **5 estados** como componentes SVG: `neutral`, `happy` (acierto o racha), `thinking` (pista), `oops` (error, sin dramatismo) y `sleeping` (racha perdida o pantalla vacía). Aparece en el onboarding, en la pantalla de resultados, en la de racha y en las pantallas vacías. **Nunca tapa contenido de los ejercicios.**

### 3.6 El mapa (pantalla principal)

Un **camino sinuoso vertical** que atraviesa un bosque dibujado con formas simples: siluetas de árboles en capas con un sutil parallax al hacer scroll (desactivado con reduced motion).

- **Nodos de lección:** piedras rúnicas circulares de 72 px. Bloqueado: gris piedra con un candado de raíz. Disponible: brillo `leaf-300` pulsante, la única animación ambiental permitida. Completado: musgo con una estrella dorada.
- **Guardián:** un nodo más grande (96 px), un portal de piedra con runas, al final de cada región.
- **Estandarte de región:** banda con el color de la región, el nombre, las fechas recomendadas («5–11 oct») y el progreso (3/8).
- **Marcador «Hoy toca»:** una banderita con un farolillo sobre el nodo que corresponde a la fecha actual según el calendario (sección 9).

**Barra superior fija:** racha (llama de hoguera + días), maná (gema violeta + total), vidas (5 corazones) y un acceso a Ajustes. **Barra inferior de pestañas:** Mapa · Repaso · Kana · Grimorio · Perfil.

### 3.7 Tono de los textos (microcopy)

Frases cortas, verbos claros, en español natural. Los nombres temáticos siempre van acompañados de una explicación clara la primera vez («Maná: tu experiencia»). Los errores no piden perdón: explican y siguen.

| Momento | Texto |
|---|---|
| Botón principal | «Comprobar» → «Continuar» |
| Acierto | «¡Bien lanzado!», «Hechizo correcto», «Eso es» (rotan) |
| Acierto con una errata | «Casi perfecto. Fíjate: おねがいします» |
| Error | «Era: すみません» + traducción + botón de audio |
| Fin de lección | «Hechizo aprendido · +12 de maná» |
| Racha | «3 días seguidos junto a la hoguera» |
| Sin vidas | «Te has quedado sin corazones. Haz un repaso para recuperarlos o espera 30 min.» |
| Repaso vacío | «No tienes nada pendiente. Vuelve mañana o aprende un hechizo nuevo.» |

---

## 4. Pantallas

1. **Onboarding** (3 pasos, solo la primera vez): presentación de Fuku y su juego de palabras → elegir la meta diaria (10/20/30/50 de maná; por defecto 20) → elegir cómo ver el romaji (por defecto «Automático», ver sección 7.4). Botón «Empezar en el campamento».
2. **Mapa:** camino con las 5 regiones (R0–R4). Tocar un nodo abre una hoja inferior con el título, lo que se aprende, el número de frases nuevas y el botón «Empezar». En nodos completados, «Practicar otra vez».
3. **Lección:** pantalla completa, sin barra inferior. Arriba: botón de cerrar (con confirmación), barra de progreso y vidas. Abajo, siempre a mano: el botón principal. Panel de feedback deslizante desde abajo (verde musgo si aciertas, ámbar-rojo si fallas) con la respuesta correcta, el audio y una nota cultural si la hay.
4. **Resultados:** maná ganado, precisión, tiempo, Fuku contento, progreso de la meta diaria y animación de racha si es el primer ejercicio del día.
5. **Repaso** (sistema de repetición espaciada, ver sección 8): contador de tarjetas pendientes, botón «Repasar ahora» (sesión de hasta 15 elementos), «Repaso de errores» (lo que fallaste en los últimos 7 días) y «Recuperar corazones».
6. **Kana (dojo):** dos tablas, hiragana y katakana, como la ficha física (filas a/k/s/t/n/h/m/y/r/w/n + dakuten + combinadas). Cada celda muestra el kana, su romaji y su nivel de dominio (0–5 anillos). Tocar una celda la reproduce en voz y muestra palabras de ejemplo. Botones: «Practicar esta fila», «Practicar los más flojos» y «Práctica rápida de 60 s».
7. **Grimorio** (colección): todas las frases aprendidas, como tarjetas de pergamino agrupadas por categoría (Básicos, Restaurante, Tiendas, Hotel, Moverse, Ayuda, Lo que te dirán). Incluye buscador (en español, romaji o kana), favoritos y audio normal y lento. Las frases no aprendidas aparecen «selladas» con su título en español, para crear curiosidad.
8. **Modo viaje:** ver sección 11.
9. **Perfil y estadísticas:** racha actual y máxima, maná total, calendario de actividad del 3 de octubre al 16 de noviembre (cuadrícula de días con hojas: vacía, una hoja o hoja dorada si se cumplió la meta), frases dominadas, kana dominados, logros y la cuenta atrás «Faltan N días para Japón».
10. **Ajustes:** meta diaria, romaji (Automático / Siempre / Solo después de responder / Nunca), voz (selector entre las voces `ja-JP` disponibles + botón de prueba), velocidad de voz (0.6 / 0.8 / 1.0), efectos de sonido, vibración, vidas activadas o desactivadas («Modo sereno»: sin vidas), tema (Sistema / Día / Noche), reducir animaciones, **exportar progreso** (descarga un JSON), **importar progreso** y **reiniciar**.

---

## 5. Mecánicas de juego

- **Maná (experiencia):** 10 por lección + 5 si no fallas ninguna + 1 por cada ejercicio de repaso acertado. Guardián: 30. Práctica rápida de kana: 1 por acierto.
- **Meta diaria:** suma de maná del día. Al cumplirla, el día del calendario se marca con hoja dorada.
- **Racha (hoguera):** sube 1 si ese día natural (zona horaria del dispositivo) completas al menos una lección o un repaso. **Amuleto de protección:** se gana uno cada 7 días de racha (máximo 2) y salva un día perdido automáticamente.
- **Vidas (corazones):** 5 como máximo. Se pierde 1 por error en lecciones y guardianes, pero no en repasos, en el dojo de kana ni en el modo viaje. Se regenera 1 cada 30 minutos (calculado con timestamps, sin temporizadores en segundo plano). Un «repaso para recuperar» de 10 elementos sin fallos devuelve 1 corazón. En «Modo sereno» las vidas no existen. **Sin vidas no se puede empezar una lección nueva, pero sí repasar.**
- **Desbloqueo:** los nodos de una región se desbloquean en orden. El guardián se desbloquea al completar todos los nodos de su región. La región siguiente se abre al vencer al guardián. Opción **«Saltar con un examen»** en el estandarte de cada región: si apruebas el guardián (≥ 80 %), toda la región se marca como completada.
- **Logros** (insignias SVG originales con forma de sello de cera): Primer hechizo · Campamento montado (R0) · Vecino del pueblo (R1) · Cliente de la taberna (R2) · Maestro del konbini (R3) · Viajero (R4) · Hiragana completo · Katakana completo · 7 días de hoguera · 21 días de hoguera · 100 frases repasadas · Lección perfecta · Políglota nocturno (lección después de las 23:00) · Madrugador (antes de las 8:00) · Preparado para Japón (todo completado antes del 2 de noviembre).

---

## 6. Tipos de ejercicio

Todos los ejercicios con japonés incluyen un **botón de altavoz** (voz `ja-JP`; una pulsación larga reproduce la versión lenta). El texto japonés siempre en `Klee One`.

| # | Tipo | Descripción | Comprobación |
|---|---|---|---|
| E1 | **Nuevo hechizo** (tarjeta de aprendizaje) | Presenta una frase nueva: kana grande, romaji, traducción, nota de uso y audio automático al aparecer. Botón «Lo tengo». | Sin evaluación |
| E2 | **Elige la traducción** (japonés → español) | Frase en japonés con audio y 4 opciones en español. | Exacta |
| E3 | **Elige el hechizo** (español → japonés) | Situación o frase en español y 4 opciones en japonés, cada una con altavoz. | Exacta |
| E4 | **Escucha y elige** | Solo audio (botón grande) y 4 opciones en kana o en español. | Exacta |
| E5 | **Construye la frase** | Traducción en español + banco de fichas con los segmentos de la frase (campo `segments`) desordenados + 2–3 fichas trampa de la misma región. Se tocan para colocarlas y se tocan de nuevo para quitarlas. | Orden exacto de los segmentos |
| E6 | **Escríbelo** | Español → teclea en romaji o en kana. Interruptor «Escribir en kana» que convierte el romaji en vivo con `wanakana.bind`. | Normalización (sección 7.3) |
| E7 | **Empareja** | 5 pares en dos columnas (kana ↔ romaji o japonés ↔ español). Al acertar un par, ambas fichas se iluminan y desaparecen. | Por par |
| E8 | **¿Qué contestas?** (lo que te dirán) | Burbuja de un personaje genérico (una silueta de dependiente, sin parecido con nadie) que dice una frase de la lista «Lo que te dirán», con audio. El usuario elige la respuesta adecuada entre 3. | Exacta |
| E9 | **Situación** | Escenario en español («Entras en una cafetería a las 9 de la mañana y te saludan») y 3–4 hechizos para elegir. | Exacta; algunas situaciones tienen varias respuestas válidas (`acceptAll`) |
| E10 | **Dilo en voz alta** | Audio de la frase → el usuario la repite. Botón opcional «Grabarme» (MediaRecorder) para escuchar su voz junto a la del modelo. Autoevaluación: «Me ha salido bien» / «Repetir». | Autoevaluada: no quita vidas y da maná solo una vez por frase y día |
| E11 | **Lee el kana** | Kana o palabra en kana → elegir o escribir el romaji. Incluye la versión inversa (romaji → elegir kana). | Exacta o normalizada |
| E12 | **Precios** | Generador aleatorio de precios realistas (sección 10.6) → elegir la lectura correcta entre 4, o escuchar la lectura y teclear la cifra. | Exacta |
| E13 | **Horas** | Reloj analógico SVG simple o una hora en texto → elegir la lectura (よじ, しちじはん…). | Exacta |
| E14 | **Carteles** | Un cartel dibujado en CSS (puerta, baño, tienda) con un kanji de supervivencia → elegir su significado. | Exacta |
| E15 | **Escena** (mini historia) | Diálogo guiado de 5–8 turnos (sección 10.8): el NPC habla, el usuario elige su réplica en cada turno. Al final, resumen de la escena. | Por turno |

**Las opciones trampa** salen de la misma región y categoría. Nunca pueden ser equivalentes a la respuesta correcta (usa el campo `equivalents`).

---

## 7. Motor de lecciones

### 7.1 Composición de una lección normal (12 ejercicios)

1. Las frases nuevas del nodo (3–5) se presentan primero con **E1**, cada una seguida inmediatamente de un ejercicio fácil sobre ella (E2 o E4).
2. Después, una mezcla de E3, E5, E6, E7, E8, E9 y E10 con las frases nuevas.
3. Hasta un 30 % de los ejercicios son **repasos** de elementos con repaso pendiente (sección 8) de nodos anteriores.
4. **Los errores vuelven a la cola**: un ejercicio fallado se repite al final de la lección (con otro tipo si es posible) hasta acertarlo, como en Duolingo.
5. Progresión de dificultad dentro de cada lección: primero reconocer (elegir), después producir (construir y escribir).

**Nodos de kana:** 10–15 ejercicios E11 y E7 con los kana del nodo, más palabras de práctica (sección 10.3) en cuanto sus kana estén aprendidos.

**Nodos de «Lo que te dirán»:** usan E1 en modo escucha, seguido de E4 y E8.

### 7.2 Guardián de región

Entre 12 y 15 ejercicios **sin tarjetas E1**, mezclando todos los tipos de la región, más los escenarios de su sección «Guardián» (sección 10). Se aprueba con un **80 %** o más. Si lo superas, se desbloquea la siguiente región y brota el campo de flores. Si no, se muestra la lista de fallos, que entran en el repaso de errores.

**El «Guardián final del juego»** (nodo especial tras R4, recomendado para el 1 de noviembre) mezcla las cuatro regiones e incluye la escena completa de un día de viaje (sección 10.8, escena 5).

### 7.3 Normalización de respuestas escritas (E6, E11)

Implementa `normalizeAnswer(input): string` con tests:

- Pasa a minúsculas, recorta espacios y elimina los espacios intermedios y la puntuación (`、。！？!?.,`).
- Si la entrada contiene kana, conviértela a romaji con `wanakana.toRomaji` antes de comparar. Compara siempre en romaji normalizado.
- **Vocales largas:** `ō`, `ou`, `oo` y `o` son equivalentes; `ū`, `uu` y `u` también. Las demás vocales con macron, igual.
- **Partículas:** は = `wa` o `ha`; を = `o` o `wo`; へ = `e` o `he`.
- `n'` y `n` son equivalentes; `tsu`/`tu`, `shi`/`si`, `chi`/`ti` y `fu`/`hu` también.
- **Tolerancia a erratas:** si la distancia de Levenshtein entre las formas normalizadas es 1 y la respuesta tiene ≥ 6 caracteres, cuenta como acierto con el aviso «Casi perfecto».

### 7.4 Romaji en modo «Automático»

- **R0–R2:** visible siempre.
- **R3–R4:** oculto hasta responder (hay un botón «Ver romaji» que cuenta como pista y no da el bonus de lección perfecta).
- **Dojo de kana:** oculto por defecto.

Esto replica la regla del dossier: el romaji es una muleta que se va retirando.

### 7.5 Aleatoriedad

Usa un generador pseudoaleatorio con semilla (mulberry32 o similar), para que los tests del generador de lecciones sean deterministas.

---

## 8. Repetición espaciada (SRS)

Sistema **Leitner de 5 cajas** por elemento (frase, kana o palabra):

| Caja | Próximo repaso |
|---|---|
| 1 | En la misma sesión o el mismo día |
| 2 | +1 día |
| 3 | +3 días |
| 4 | +7 días |
| 5 | +14 días (dominado) |

- **Acierto:** sube una caja. **Fallo:** vuelve a la caja 1 y suma `lapses += 1`.
- Un elemento entra en la caja 1 la primera vez que se presenta con E1.
- La pantalla Repaso prioriza: (1) los vencidos con más `lapses`, (2) los vencidos más antiguos y (3) las frases de la región actual.
- **Antes del viaje:** del 26 de octubre al 1 de noviembre, las cajas 4 y 5 se repasan con intervalos a la mitad, para llegar con todo fresco.
- El nivel de dominio de un kana en el dojo es su número de caja (0 si nunca se ha visto).

---

## 9. Calendario del plan

La app conoce el calendario del dossier y marca **«Hoy toca»** en el mapa según la fecha. **No bloquea por fecha**: se puede ir más rápido o más lento. Si vas atrasado más de 3 días, se muestra un aviso amable en el mapa: «Vas 4 días por detrás del plan. ¿Hacemos dos lecciones hoy?».

| Fecha | Nodo recomendado |
|---|---|
| Sáb 3 oct | R0-1 Pronunciación |
| Dom 4 oct | R0-2 Vocales あいうえお |
| Lun 5 – Dom 11 oct | R1, un nodo al día según la tabla de nodos; domingo 11, el guardián |
| Lun 12 – Dom 18 oct | R2; domingo 18, el guardián |
| Lun 19 – Dom 25 oct | R3; domingo 25, el guardián |
| Lun 26 oct – Sáb 31 oct | R4 |
| Dom 1 nov | Guardián final del juego |
| 2–16 nov | El modo viaje pasa a ser la pantalla de inicio por defecto |

Cada región tiene más nodos que días, así que la asignación concreta de nodos a días está en la sección 10, en la columna «Día» de cada tabla de nodos.

---

## 10. Contenido (datos semilla)

Crea `src/content/` con un archivo por región (`r0.ts` … `r4.ts`), más `kana.ts`, `numbers.ts`, `clock.ts`, `kanji.ts` y `scenes.ts`. **Usa exactamente estos textos.** No inventes frases nuevas sin marcarlas con `generated: true`.

Formato de las frases: `kana | romaji | español | nota`. Los **segmentos** para E5 son las partes separadas por espacios en el kana (las frases sin espacios forman un solo segmento: en E5 solo se usan las que tienen 2 segmentos o más).

### 10.1 Región 0 · El campamento (3–4 oct)

**Nodo R0-1 «Pronunciación»** (sin vidas, solo tarjetas informativas y E4/E10). Tarjetas:

- **h:** una «j» muy suave, como un suspiro (はい *hai*).
- **r:** la «r» suave de «pero» (ラーメン *rāmen*).
- **j:** como en inglés *jeans* (じゃあね *jā ne*).
- **g:** siempre fuerte: *ge* = «gue» (げんき *genki*).
- **z:** una «s» zumbante (みず *mizu*).
- **sh, ch, ts:** como *shhh*, «chico» y *tsunami* (すし *sushi*).
- **ō, ū:** vocal larga, dura el doble (ありがとう *arigatō*).
- **u final:** casi muda en です y ます («des», «mas»).
- **Consonantes dobles (kk, tt):** micropausa antes (きって *kitte*).

**Nodo R0-2 «Vocales»:** あ い う え お.

**Tarjeta cultural:** los tres alfabetos. El hiragana es para palabras japonesas y gramática; el katakana, para palabras extranjeras (cartas de restaurante, videojuegos); y el kanji son caracteres con significado (solo necesitas reconocer unos pocos). Cada kana es una sílaba.

### 10.2 Región 1 · El pueblo inicial (5–11 oct) — saludos y cortesía

**Frases para decir:**

```
1  おはようございます | ohayō gozaimasu | Buenos días | Hasta media mañana. Con amigos basta con おはよう.
2  こんにちは | konnichiwa | Hola / buenas tardes | El は del final se lee «wa».
3  こんばんは | konbanwa | Buenas noches (al llegar) | Para saludar a partir del atardecer.
4  ありがとうございます | arigatō gozaimasu | Muchas gracias | Tu hechizo más usado del viaje.
5  どうも | dōmo | Gracias (versión corta) | Para la cajera o quien te sujeta la puerta.
6  すみません | sumimasen | Disculpe / perdón / gracias por la molestia | El comodín: llamar a alguien, pedir paso, disculparte.
7  ごめんなさい | gomen nasai | Lo siento | Más personal. Como turista te basta すみません.
8  はい / いいえ | hai / iie | Sí / No | いいえ suena seco; muchas veces es mejor だいじょうぶです.
9  だいじょうぶです | daijōbu desu | Estoy bien / no hace falta, gracias | Para rechazar con educación. Kanji: 大丈夫.
10 おねがいします | onegai shimasu | Por favor (te lo pido) | Va detrás de lo que quieres.
11 どうぞ | dōzo | Adelante / tome / usted primero |
12 はじめまして | hajimemashite | Encantado/a | Solo la primera vez que conoces a alguien.
13 わたしは ＿＿ です | watashi wa ＿＿ desu | Soy ＿＿ / me llamo ＿＿ | El hueco se rellena con el nombre del usuario (pídelo en Ajustes; por defecto «Alex»).
14 スペインから きました | Supein kara kimashita | Vengo de España |
15 わかりません | wakarimasen | No entiendo |
16 にほんごは すこしだけです | nihongo wa sukoshi dake desu | Solo hablo un poco de japonés | Hace que te hablen más despacio.
17 しつれいします | shitsurei shimasu | Con permiso | Al entrar o salir de un sitio o pasar por delante de alguien.
```

**Lo que te dirán:**

```
いらっしゃいませ | irasshaimase | ¡Bienvenido! | No hay que contestar: basta un gesto con la cabeza.
ありがとうございました | arigatō gozaimashita | Gracias (por haber venido) | Al salir de la tienda.
どういたしまして | dō itashimashite | De nada | Suelen responder con いえいえ (iie iie).
おきを つけて | o-ki o tsukete | ¡Cuídate! / ¡Buen viaje! | Se lo dicen a quien se marcha.
```

**Tarjetas de gramática** (E1 informativas, una por nodo):

- **El verbo va al final:** わたしは すしを たべます = Yo · sushi · como. Si no entiendes una frase, escucha el final.
- **です y ます:** el modo educado. Habla siempre así. Se pronuncian «des» y «mas».
- **は (wa):** «en cuanto a…». わたしは マリアです. Como partícula se escribe は (ha) pero se lee «wa».
- **か:** se añade al final para preguntar. すしです → すしですか.

**Tarjetas de cultura («Saber del bosque»):** すみません es la palabra mágica · basta una pequeña inclinación de cabeza · en las tiendas no se dice さようなら (suena a despedida larga): basta ありがとう o どうも · en el tren se habla bajito.

**Kana:** filas か, さ, た, な.

**Palabras de práctica:**

```
すし | sushi | sushi
えき | eki | estación
ちかてつ | chikatetsu | metro
ねこ | neko | gato
おかね | okane | dinero
あき | aki | otoño
さけ | sake | sake
せかい | sekai | mundo
```

**Nodos:**

| Nodo | Contenido | Día |
|---|---|---|
| R1-1 | Saludos (1–3) + kana か | Lun 5 |
| R1-2 | Gracias y perdón (4–7) + kana さ | Mar 6 |
| R1-3 | Sí, no y por favor (8–11) + gramática «El verbo va al final» | Mié 7 |
| R1-4 | Kana た y な + palabras de práctica | Mié 7 – Jue 8 |
| R1-5 | Presentarse (12–14) + gramática です/ます y は | Jue 8 |
| R1-6 | Cuando no entiendes (15–17) + gramática か | Vie 9 |
| R1-7 | Lo que te dirán + escena 1 | Sáb 10 |
| Guardián R1 | | Dom 11 |

**Escenarios del guardián R1 (E9):**

1. Entras en una cafetería a las 9 de la mañana y te saludan → おはようございます.
2. Alguien se aparta para dejarte pasar en una escalera estrecha → すみません **o** ありがとうございます (`acceptAll`).
3. La cajera te pregunta algo y no lo entiendes → すみません、わかりません.
4. Te ofrecen ayuda que no necesitas → だいじょうぶです.
5. Te presentan a alguien → はじめまして.
6. Al salir de una tienda te dicen ありがとうございました → «No hace falta decir nada; basta un gesto o どうも».

### 10.3 Región 2 · La taberna (12–18 oct) — restaurantes

**Frases para decir:**

```
1  ふたりです | futari desu | Somos dos | Enseña dos dedos. Kanji: 二人.
2  ふたり、おねがいします | futari, onegai shimasu | Mesa para dos, por favor |
3  よやくしていません | yoyaku shite imasen | No tengo reserva |
4  ＿＿で よやくしています | ＿＿ de yoyaku shite imasu | Tengo reserva a nombre de ＿＿ |
5  すみません！ | sumimasen! | ¡Perdone! (para llamar al camarero) | Es normal decirlo en voz alta. Hay mesas con timbre.
6  メニューを ください | menyū o kudasai | La carta, por favor |
7  えいごの メニューは ありますか | eigo no menyū wa arimasu ka | ¿Tienen carta en inglés? |
8  これを ください | kore o kudasai | Esto, por favor | Señalando la foto. Funciona siempre.
9  これを ふたつ ください | kore o futatsu kudasai | Dos de esto, por favor |
10 おすすめは なんですか | osusume wa nan desu ka | ¿Qué me recomienda? |
11 おみずを ください | o-mizu o kudasai | Agua, por favor | El agua y el té suelen ser gratis.
12 なまビール ふたつ | nama bīru futatsu | Dos cañas | なまビール = cerveza de barril.
13 しょうゆは ありますか | shōyu wa arimasu ka | ¿Tienen salsa de soja? | En el bote: 醤油.
14 フォークを もらえますか | fōku o moraemasu ka | ¿Me puede dar un tenedor? | Ver la tarjeta «¿Prestar un tenedor?».
15 ＿＿ぬきで おねがいします | ＿＿ nuki de onegai shimasu | Sin ＿＿, por favor | わさびぬきで = sin wasabi.
16 ＿＿アレルギーが あります | ＿＿ arerugī ga arimasu | Tengo alergia a ＿＿ |
17 いただきます | itadakimasu | (Antes de comer) ¡Que aproveche! |
18 おいしいです！ | oishii desu! | ¡Está buenísimo! |
19 ごちそうさまでした | gochisōsama deshita | Gracias por la comida | Al terminar o al salir.
20 おかいけい おねがいします | o-kaikei onegai shimasu | La cuenta, por favor | Gesto: índices en X. Kanji: お会計.
21 かんぱい！ | kanpai! | ¡Salud! |
```

**Vocabulario extra:** フォーク (tenedor) · スプーン (cuchara) · ナイフ (cuchillo) · おはし (palillos) · おしぼり (toallita para las manos).

**Lo que te dirán:**

```
なんめいさまですか | nanmei-sama desu ka | ¿Cuántas personas? | Responde ふたりです.
しょうしょう おまちください | shōshō o-machi kudasai | Espere un momento |
こちらへ どうぞ | kochira e dōzo | Por aquí, por favor |
ごちゅうもんは おきまりですか | go-chūmon wa o-kimari desu ka | ¿Ya han decidido? | Si no: まだです.
おのみものは？ | o-nomimono wa? | ¿Y para beber? |
いじょうで よろしいですか | ijō de yoroshii desu ka | ¿Eso es todo? | はい.
おかいけいは レジで おねがいします | o-kaikei wa reji de onegai shimasu | Se paga en caja |
```

**Gramática:**

- **X を ください:** «deme X». を se pronuncia «o».
- **X は ありますか:** «¿tienen X?». Respuesta negativa: すみません、ありません.
- **の = «de», pero al revés:** A の B = B de A. Ejemplos: ゼルダの でんせつ (la leyenda de Zelda) · そうそうの フリーレン (título original de *Frieren*: «la Frieren del último adiós») · えいごの メニュー (carta en inglés).
- **Contar:** personas ひとり ふたり さんにん よにん ごにん; cosas ひとつ ふたつ みっつ よっつ いつつ.

**Tarjeta «¿Prestar un tenedor?»:** «prestar» (かす) implica que tú lo devuelves, y en un restaurante suena raro. Lo natural es もらえますか («¿puedo recibir?»). Para un bolígrafo que devuelves enseguida sí vale ペンを かして ください. El japonés traduce situaciones, no palabras.

**Cultura:** no se deja propina · se paga en caja, a la salida · máquinas de tickets (しょっけん / 食券) en los locales de ramen · sorber los fideos está bien · no se clavan los palillos de pie en el arroz ni se pasa comida de palillo a palillo · la おしぼり es para las manos.

**Kana:** filas は, ま, や, ら, わ/を/ん + tenten (が ざ だ ば) + maru (ぱ) + combinadas (きゃ きゅ きょ, しゃ しゅ しょ, ちゃ ちゅ ちょ, にゃ…, ひゃ…, みゃ…, りゃ…, ぎゃ…, じゃ じゅ じょ, びゃ…, ぴゃ…).

**Palabras de práctica:**

```
ごはん | gohan | arroz / comida
みず | mizu | agua
わさび | wasabi | wasabi
しょうゆ | shōyu | salsa de soja
やきとり | yakitori | brochetas de pollo
てんぷら | tenpura | tempura
りょかん | ryokan | posada tradicional
ぎゅうどん | gyūdon | bol de arroz con ternera
```

**Nodos:**

| Nodo | Contenido | Día |
|---|---|---|
| R2-1 | En la puerta (1–4) + kana は | Lun 12 |
| R2-2 | Pedir (5–9) + gramática を ください + kana ま | Mar 13 |
| R2-3 | Preguntar (10–13) + gramática ありますか + kana や/ら | Mié 14 |
| R2-4 | El tenedor y las alergias (14–16) + tarjeta del tenedor + kana わ/を/ん y tenten | Jue 15 |
| R2-5 | Comer y pagar (17–21) + gramática の y contar + combinadas | Vie 16 |
| R2-6 | Lo que te dirán + escena 2 | Sáb 17 |
| Guardián R2 | | Dom 18 |

**Escenarios del guardián R2:**

1. Te preguntan なんめいさまですか → ふたりです.
2. Queréis dos cañas → なまビール ふたつ.
3. Prefieres un tenedor → フォークを もらえますか.
4. Quieres salsa de soja → しょうゆは ありますか.
5. Sushi sin wasabi → わさびぬきで おねがいします.
6. Antes de comer → いただきます.
7. Quieres pagar → おかいけい おねがいします.
8. Al salir → ごちそうさまでした.

### 10.4 Región 3 · El mercado (19–25 oct) — tiendas, konbini y dinero

**Frases para decir:**

```
1  いくらですか | ikura desu ka | ¿Cuánto es? |
2  これは いくらですか | kore wa ikura desu ka | ¿Cuánto cuesta esto? |
3  これは なんですか | kore wa nan desu ka | ¿Qué es esto? | Imprescindible en el súper.
4  ＿＿は ありますか | ＿＿ wa arimasu ka | ¿Tienen ＿＿? | Repaso.
5  これを ください | kore o kudasai | Me llevo esto | Repaso.
6  カード、つかえますか | kādo, tsukaemasu ka | ¿Se puede pagar con tarjeta? |
7  げんきんで | genkin de | En efectivo |
8  ふくろを ください | fukuro o kudasai | Una bolsa, por favor | Las bolsas se cobran aparte.
9  ふくろは いりません | fukuro wa irimasen | No necesito bolsa | O だいじょうぶです.
10 あたためて ください | atatamete kudasai | Caliéntelo, por favor | En el konbini.
11 おはしを ください | o-hashi o kudasai | Unos palillos, por favor |
12 みているだけです | mite iru dake desu | Solo estoy mirando |
13 しちゃくしても いいですか | shichaku shite mo ii desu ka | ¿Me lo puedo probar? |
14 めんぜいできますか | menzei dekimasu ka | ¿Hacen tax-free? | Ver la tarjeta del tax-free.
```

**Lo que te dirán (en el konbini):**

```
ふくろは ごりようですか | fukuro wa go-riyō desu ka | ¿Quiere bolsa? |
あたためますか | atatamemasu ka | ¿Se lo caliento? |
おはしは おつけしますか | o-hashi wa o-tsuke shimasu ka | ¿Le pongo palillos? |
ポイントカードは おもちですか | pointo kādo wa o-mochi desu ka | ¿Tiene tarjeta de puntos? | いいえ.
おしはらいは？ | o-shiharai wa? | ¿Cómo va a pagar? | カードで / げんきんで.
＿＿えんに なります | ＿＿ en ni narimasu | Son ＿＿ yenes |
```

**Gramática:**

- **これ / それ / あれ / どれ** (solo), **この / その / あの / どの** + cosa, y **ここ / そこ / あそこ / どこ** (lugares).
- **Números:** ver la sección 10.6.
- **で = «con» / «por medio de»:** カードで, げんきんで, でんしゃで.

**Tarjeta de aviso sobre el tax-free:** desde el 1 de noviembre de 2026, Japón pasa a un sistema de reembolso. En la tienda pagas el precio con el 10 % de impuesto, enseñas el pasaporte, y la devolución se tramita en la aduana antes de salir del país. El mínimo es de 5.000 yenes sin impuestos en la misma tienda el mismo día. No se pueden consumir en Japón los productos comprados así. Termina con «Consulta el procedimiento de tu aeropuerto antes de volar».

**Cultura:** el dinero se deja en la bandejita de la caja (トレー) · por la tarde hay descuentos en el súper: 半額 (mitad de precio) y 割引 (descuento) · casi no hay papeleras en la calle · no se suele comer andando.

**Tarjeta «El katakana es tu idioma»:** el katakana se usa para palabras extranjeras, y por eso videojuegos y anime están llenos de él. La raya ー alarga la vocal.

**Kana:** katakana completo ア–ン + tenten y maru.

**Palabras de práctica:**

```
ゲーム | gēmu | videojuego
ハイラル | Hairaru | Hyrule
フリーレン | Furīren | Frieren
ヒンメル | Hinmeru | Himmel
コーヒー | kōhī | café
ビール | bīru | cerveza
カレー | karē | curry
ケーキ | kēki | pastel
カード | kādo | tarjeta
アイテム | aitemu | objeto
セーブ | sēbu | guardar partida
ボス | bosu | jefe
```

**Nodos:**

| Nodo | Contenido | Día |
|---|---|---|
| R3-1 | ¿Cuánto es? (1–3) + números 1–10 + katakana ア–ソ | Lun 19 |
| R3-2 | Pagar (4–7) + números hasta 100 + katakana タ–ホ | Mar 20 |
| R3-3 | Bolsas y comida (8–10) + cientos, miles y まん + katakana マ–ン | Mié 21 |
| R3-4 | De tiendas (11–14) + tenten y maru en katakana + tarjeta del tax-free | Jue 22 |
| R3-5 | Lo que te dirán en el konbini + escena 3 | Vie 23 |
| R3-6 | Precios (solo E12) + palabras de práctica | Sáb 24 |
| Guardián R3 | | Dom 25 |

**Escenarios del guardián R3:** decir en voz alta (E12) 150, 380, 1.000, 2.600, 7.800 y 15.000 円; responder en el konbini (E8): あたためますか → はい、おねがいします · おはしは おつけしますか → はい、おねがいします · ふくろは ごりようですか (no quieres bolsa) → だいじょうぶです · ポイントカードは おもちですか → いいえ · おしはらいは？ (con tarjeta) → カードで; y ves algo raro en una estantería → これは なんですか.

### 10.5 Región 4 · El gran viaje (26 oct – 1 nov) — hotel, transporte y ayuda

**Frases para decir:**

```
1  チェックイン おねがいします | chekku-in onegai shimasu | Quiero hacer el check-in |
2  ＿＿で よやくしています | ＿＿ de yoyaku shite imasu | Tengo reserva a nombre de ＿＿ | Repaso.
3  チェックアウトは なんじですか | chekku-auto wa nanji desu ka | ¿A qué hora es el check-out? |
4  あさごはんは なんじからですか | asagohan wa nanji kara desu ka | ¿Desde qué hora es el desayuno? |
5  Wi-Fiの パスワードは なんですか | waifai no pasuwādo wa nan desu ka | ¿Cuál es la contraseña del wifi? |
6  にもつを あずかって もらえますか | nimotsu o azukatte moraemasu ka | ¿Me pueden guardar el equipaje? |
7  ＿＿は どこですか | ＿＿ wa doko desu ka | ¿Dónde está ＿＿? |
8  トイレは どこですか | toire wa doko desu ka | ¿Dónde está el baño? |
9  ＿＿に いきたいです | ＿＿ ni ikitai desu | Quiero ir a ＿＿ |
10 この でんしゃは ＿＿に いきますか | kono densha wa ＿＿ ni ikimasu ka | ¿Este tren va a ＿＿? |
11 ＿＿まで おねがいします | ＿＿ made onegai shimasu | A ＿＿, por favor (taxi) | La puerta del taxi se abre sola.
12 きっぷは どこで かえますか | kippu wa doko de kaemasu ka | ¿Dónde se compran los billetes? |
13 えいごを はなせますか | eigo o hanasemasu ka | ¿Habla inglés? |
14 もういちど おねがいします | mō ichido onegai shimasu | Otra vez, por favor |
15 ゆっくり おねがいします | yukkuri onegai shimasu | Más despacio, por favor |
16 しゃしんを とっても いいですか | shashin o totte mo ii desu ka | ¿Puedo hacer fotos? |
17 しゃしんを とって もらえますか | shashin o totte moraemasu ka | ¿Nos puede hacer una foto? |
18 みちに まよいました | michi ni mayoimashita | Me he perdido | Busca un こうばん (garita de policía).
19 きぶんが わるいです | kibun ga warui desu | Me encuentro mal |
20 たすけて ください | tasukete kudasai | ¡Ayuda, por favor! | 110 policía · 119 ambulancia y bomberos.
```

**Lo que te dirán:**

```
パスポートを おねがいします | pasupōto o onegai shimasu | El pasaporte, por favor |
こちらに ごきにゅう ください | kochira ni go-kinyū kudasai | Rellene aquí, por favor |
おへやは ＿＿かいです | o-heya wa ＿＿-kai desu | Su habitación está en la planta ＿＿ |
まもなく ＿＿です | mamonaku ＿＿ desu | Llegamos en breve a ＿＿ | Megafonía del tren.
つぎは ＿＿ | tsugi wa ＿＿ | Próxima parada: ＿＿ |
ドアが しまります | doa ga shimarimasu | Se cierran las puertas |
のりかえ | norikae | Transbordo | En carteles: 乗り換え.
```

**Gramática:**

- **Partículas de movimiento:** に (a, destino) · で (en, dónde pasa algo) · から (desde) · まで (hasta).
- **～たい:** ～ます → ～たいです (いきたいです, たべたいです, かいたいです).
- **Fórmulas con て:** ～ても いいですか (¿puedo…?) y ～て もらえますか (¿podría… por mí?).
- **Las horas:** ver la sección 10.7.

**Kana:** katakana combinado (シャ チュ ジョ…), la ッ pequeña, la raya ー y combinaciones extendidas (チェ, フェ, ティ).

**Kanji de supervivencia (E14):**

```
入口 | iriguchi | entrada
出口 | deguchi | salida
男 | otoko | hombres
女 | onna | mujeres
駅 | eki | estación
円 | en | yen
押 | osu | empujar
引 | hiku | tirar
営業中 | eigyōchū | abierto
準備中 | junbichū | cerrado (en preparación)
禁止 | kinshi | prohibido
半額 | hangaku | mitad de precio
```

**Palabras de práctica:**

```
チェックイン | chekku-in | check-in
メニュー | menyū | carta
シュタルク | Shutaruku | Stark
フェルン | Ferun | Fern
パスポート | pasupōto | pasaporte
ジュース | jūsu | zumo
ショッピング | shoppingu | compras
スイッチ | suicchi | interruptor / Switch
```

**Nodos:**

| Nodo | Contenido | Día |
|---|---|---|
| R4-1 | En el hotel (1–6) + horas + katakana combinado | Lun 26 |
| R4-2 | ¿Dónde está? (7–9) + partículas de movimiento + ッ y ー | Mar 27 |
| R4-3 | En el tren y en el taxi (10–12) + ～たい | Mié 28 |
| R4-4 | Pedir ayuda (13–17) + fórmulas con て | Mié 28 – Jue 29 |
| R4-5 | Emergencias (18–20) + kanji de supervivencia | Jue 29 |
| R4-6 | Lo que te dirán + escena 4 | Vie 30 |
| R4-7 | Repaso general (todo lo que tenga repaso pendiente) | Sáb 31 |
| Guardián R4 | | Sáb 31 |
| Guardián final del juego | Escena 5 + mezcla de las 4 regiones | Dom 1 nov |

### 10.6 Números y precios (`numbers.ts`)

Implementa `toJapaneseReading(n: number): { kana: string; romaji: string }` para 0–99.999 **con tests de todos estos casos**:

| Número | Lectura |
|---|---|
| 1–10 | いち に さん よん ご ろく なな はち きゅう じゅう |
| 11 | じゅういち |
| 20 | にじゅう |
| 35 | さんじゅうご |
| 100 | ひゃく |
| 300 | さんびゃく |
| 600 | ろっぴゃく |
| 800 | はっぴゃく |
| 1.000 | せん |
| 3.000 | さんぜん |
| 8.000 | はっせん |
| 10.000 | いちまん |
| 15.000 | いちまん ごせん |
| 150 | ひゃくごじゅう |
| 380 | さんびゃくはちじゅう |
| 1.200 | せんにひゃく |
| 2.600 | にせんろっぴゃく |
| 7.800 | ななせんはっぴゃく |
| 12.800 | いちまんにせんはっぴゃく |

Para precios, añade «えん» al final. El generador de precios usa importes realistas: múltiplos de 10 entre 100 y 3.000 para el konbini, y de 100 entre 1.000 y 30.000 para tiendas.

### 10.7 Horas (`clock.ts`)

いちじ, にじ, さんじ, **よじ**, ごじ, ろくじ, **しちじ**, はちじ, **くじ**, じゅうじ, じゅういちじ, じゅうにじ. Las tres en negrita son irregulares: márcalas en rojo en la tarjeta de aprendizaje. 「はん」 = y media. ごぜん = de la mañana; ごご = de la tarde. ¿Qué hora es? = なんじですか.

### 10.8 Escenas (E15, `scenes.ts`)

1. **R1 «Primer paseo»:** entras en una tienda (いらっしゃいませ → gesto), saludas al recepcionista, alguien te ofrece ayuda (だいじょうぶです), no entiendes una pregunta (わかりません), te despides (ありがとうございました → どうも).
2. **R2 «Cena en el izakaya»:** なんめいさまですか → ふたりです; こちらへ どうぞ; おのみものは？ → なまビール ふたつ; pides con これを ください; pides un tenedor; ごちゅうもんは… → まだです; いただきます; pagar; ごちそうさまでした.
3. **R3 «En la caja del konbini»:** いらっしゃいませ; あたためますか; おはしは おつけしますか; ふくろは ごりようですか; ポイントカードは おもちですか; ＿えんに なります (precio aleatorio, hay que reconocer la cifra); おしはらいは？; ありがとうございました.
4. **R4 «Llegada al hotel»:** saludar, check-in, reserva a tu nombre, パスポートを おねがいします, こちらに ごきにゅう ください, preguntar la hora del desayuno, la contraseña del wifi, おへやは ＿かいです.
5. **Final «Un día en Japón»:** hotel → preguntar por la estación → ¿este tren va a Shibuya? → pedir que lo repitan despacio → foto en un templo → taxi de vuelta → guardar el equipaje el último día.

Los personajes de las escenas son **siluetas genéricas** con uniformes neutros (dependiente, recepcionista, camarero, revisor), dibujadas en SVG simple.

---

## 11. Modo viaje (2–16 de noviembre)

Entre esas fechas, la app abre directamente en el **Modo viaje**. También se puede abrir siempre desde Grimorio → «Modo viaje».

- **Categorías grandes** (tarjetas de 2 columnas): Básicos · Restaurante · Tiendas y konbini · Hotel · Moverse · Ayuda y emergencias · Lo que te dirán · Números y precios.
- Cada frase muestra el **japonés grande**, el romaji, el español y dos botones de audio (normal y lento).
- **«Enseñar al personal»:** pantalla completa con fondo claro, el japonés enorme (con kanji si el campo `kanji` existe, si no en kana) y la traducción pequeña debajo. Mantiene la pantalla encendida con la Wake Lock API si está disponible.
- **Huecos rellenables:** en frases con ＿＿, permite escribir el texto (por ejemplo, el nombre del hotel o de la estación) y guardarlo como favorito: «Hotel: ＿＿まで おねがいします».
- **Calculadora de precios:** tecleas una cifra y te muestra la lectura en japonés y su equivalente en euros (con un tipo de cambio editable en Ajustes, sin red).
- **Emergencias** siempre visibles arriba: 110 policía · 119 ambulancia y bomberos · たすけて ください, con botones `tel:`.
- Buscador y favoritos.
- **Funciona sin conexión.**

---

## 12. Voz (TTS)

- Usa `speechSynthesis` con `lang = 'ja-JP'`. Elige por defecto la mejor voz japonesa disponible (en iOS suele ser «Kyoko» u «Otoya»; en Android, la de Google). Guarda la preferencia.
- Carga las voces de forma robusta (`voiceschanged` + reintento), porque en algunos navegadores llegan tarde.
- **Si no hay voz japonesa**, muestra un aviso único y claro con instrucciones (iOS: Ajustes → Accesibilidad → Contenido leído → Voces → Japonés; Android: Ajustes de texto a voz de Google → instalar datos de japonés). Los ejercicios solo de audio (E4) se sustituyen por E2 en ese caso.
- En las frases con hueco ＿＿, la voz lee lo que haya en el hueco o una pausa.
- Velocidades: normal 0.9; lenta 0.6.

**Efectos de sonido** sintetizados con Web Audio: acierto (dos notas ascendentes tipo campanilla, con una cola de reverberación corta), error (una nota grave suave, nada estridente), fin de lección (un arpegio de 4 notas) y campo de flores (un brillo cristalino). Volumen moderado y desactivables.

**Vibración** (`navigator.vibrate`, solo Android): 15 ms al acertar, 40 ms al fallar.

---

## 13. Modelo de datos

```ts
type RegionId = 'r0' | 'r1' | 'r2' | 'r3' | 'r4';

type Category =
  | 'basics' | 'restaurant' | 'shopping' | 'hotel' | 'transport' | 'help';

interface Phrase {
  id: string;                 // 'r2-p13'
  regionId: RegionId;
  kind: 'say' | 'hear';       // 'hear' = «Lo que te dirán»
  kana: string;               // con espacios entre segmentos
  romaji: string;
  es: string;
  note?: string;
  kanji?: string;             // forma natural con kanji, para «Enseñar al personal»
  segments: string[];         // derivado de kana.split(' ')
  category: Category;
  hasBlank?: boolean;         // contiene ＿＿
  equivalents?: string[];     // ids de frases que también son correctas en una situación
  suggestedReplies?: string[];// solo para 'hear': ids de las respuestas válidas
  generated?: boolean;
}

interface KanaChar {
  id: string;                 // 'h-ka', 'k-sha'
  char: string;
  romaji: string;
  script: 'hiragana' | 'katakana';
  group: 'basic' | 'dakuten' | 'handakuten' | 'yoon' | 'extended';
  row: string;                // 'k', 's', 'ky'...
}

interface PracticeWord {
  id: string;
  kana: string;
  romaji: string;
  es: string;
  requiredKana: string[];
}

interface InfoCard {
  id: string;
  regionId: RegionId;
  type: 'grammar' | 'culture' | 'pronunciation' | 'alert';
  title: string;
  body: string;               // markdown simple
  examples?: { jp: string; romaji: string; es: string }[];
}

interface LessonNode {
  id: string;                 // 'r2-3'
  regionId: RegionId;
  title: string;
  kind: 'phrases' | 'kana' | 'heard' | 'review' | 'boss' | 'finalBoss';
  phraseIds: string[];
  kanaIds: string[];
  infoCardIds: string[];
  sceneId?: string;
  recommendedDate: string;    // ISO 'YYYY-MM-DD'
}

interface Scenario {
  id: string;
  regionId: RegionId;
  promptEs: string;
  correctPhraseIds: string[];
  explanation?: string;
}

interface SrsState {
  itemId: string;
  box: 1 | 2 | 3 | 4 | 5;
  due: string;                // ISO
  lapses: number;
  lastSeen: string;
}

interface Progress {
  version: number;
  userName: string;
  xpTotal: number;
  xpByDay: Record<string, number>;
  streak: { current: number; best: number; lastActiveDay: string; freezes: number };
  hearts: { count: number; updatedAt: string };
  completedNodes: string[];
  passedBosses: RegionId[];
  srs: Record<string, SrsState>;
  favorites: string[];
  filledBlanks: Record<string, string>;
  achievements: Record<string, string>;   // id → fecha
  mistakesLog: { itemId: string; at: string }[];
  settings: Settings;
}
```

Cubre con tests las funciones puras del dominio: `generateLesson(node, progress, seed)`, `checkAnswer`, `normalizeAnswer`, `scheduleNext`, `updateStreak(today)`, `regenHearts(now)`, `isUnlocked(node, progress)` y `toJapaneseReading`.

---

## 14. Persistencia y copia de seguridad

- Todo el progreso se guarda en `localStorage` mediante Zustand `persist`, con `version` y una función `migrate`.
- Pide almacenamiento persistente con `navigator.storage.persist()` al terminar el onboarding.
- Exportar progreso: descarga `kotodama-progreso-AAAA-MM-DD.json`. Importar: valida la estructura antes de aplicarla y pide confirmación.
- Un aviso discreto en Perfil, si llevas más de 7 días sin exportar: «Haz una copia de tu progreso antes del viaje».

---

## 15. Accesibilidad, rendimiento y móvil

- **Diseño mobile-first** para 360–430 px de ancho. En tablet o escritorio, el contenido se centra con un máximo de 480 px.
- Zonas táctiles de **48 px** como mínimo. El botón principal siempre en la zona del pulgar. Respeta `env(safe-area-inset-*)` (notch y barra de gestos) con `viewport-fit=cover`.
- Navegable con lector de pantalla: `aria-live` en el feedback, etiquetas en todos los botones de audio y `lang="ja"` en todo el texto japonés.
- Foco visible, `prefers-reduced-motion` y `prefers-color-scheme` respetados.
- Contraste AA verificado para ambos temas.
- Rendimiento: carga inicial < 300 KB gzip sin contar las fuentes. Subconjuntos de fuentes (kana, kanji usados y latín) si `@fontsource` lo permite; si no, carga diferida de las fuentes japonesas. Lighthouse PWA y Accesibilidad ≥ 90.
- Manifest: nombre «Kotodama», nombre corto «Kotodama», `display: standalone`, `orientation: portrait`, color de tema `#1D5C48`, color de fondo `#E9F0E6`. Iconos 192, 512 y maskable con un diseño original (la letra 言 dentro de un círculo de hechizo sobre verde bosque). Incluye `apple-touch-icon`.

---

## 16. Estructura de carpetas

```
kotodama/
├─ CLAUDE.md                  # resumen del proyecto y convenciones (créalo en la fase 0)
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts
├─ public/                    # iconos, manifest
├─ src/
│  ├─ main.tsx · App.tsx · routes.tsx
│  ├─ theme/                  # tokens.css, fonts.ts
│  ├─ content/                # r0.ts … r4.ts, kana.ts, numbers.ts, clock.ts, kanji.ts, scenes.ts, index.ts
│  ├─ domain/                 # lessonGenerator.ts, answerCheck.ts, srs.ts, streak.ts, hearts.ts, unlock.ts, calendar.ts, rng.ts
│  ├─ store/                  # progressStore.ts (Zustand), settingsStore.ts
│  ├─ audio/                  # tts.ts, sfx.ts
│  ├─ components/
│  │  ├─ map/                 # ForestPath, NodeStone, RegionBanner, FlowerField
│  │  ├─ exercises/           # un componente por tipo E1–E15
│  │  ├─ magic/               # SpellCircle, Sparkles
│  │  ├─ mascot/              # Fuku (5 estados)
│  │  └─ ui/                  # Button, BottomSheet, ProgressBar, HeartBar, TopBar, TabBar, JpText
│  ├─ screens/                # Onboarding, Map, Lesson, Results, Review, KanaDojo, Grimoire, TravelMode, Profile, Settings
│  └─ tests/
└─ .github/workflows/deploy.yml
```

---

## 17. Fases de desarrollo

**Prioridad absoluta:** necesito poder estudiar **lo antes posible**. La fase 1 debe dejar una app usable, aunque sea fea.

| Fase | Contenido | Criterio de aceptación |
|---|---|---|
| **0 · Base** | Proyecto Vite + TS + Tailwind + Zustand + PWA. Tokens de color, fuentes y tema día/noche. `CLAUDE.md`. Workflow de despliegue en GitHub Pages. | `npm run build` sin errores. La app vacía se instala en el móvil y abre offline. |
| **1 · MVP de estudio** | Todo el contenido de la sección 10 en `src/content`. Motor de lecciones. Ejercicios E1, E2, E3, E4, E7 y E11. TTS. Mapa funcional (aunque sea una lista estilizada). Progreso persistente. | Puedo completar R0 y R1 enteras en el móvil y el progreso sobrevive a cerrar la app. |
| **2 · Juego** | Maná, meta diaria, racha con amuletos, vidas, pantalla de resultados, logros. Círculo de hechizo y efectos de sonido. Mapa definitivo con el bosque, los estandartes y «Hoy toca». Fuku. | Las reglas de la sección 5 están cubiertas por tests. |
| **3 · Todos los ejercicios** | E5, E6 (con `wanakana`), E8, E9, E10, E12, E13, E14 y E15. Guardianes y guardián final. Campo de flores. | Todos los tipos aparecen en las lecciones. Los tests de `normalizeAnswer` y `toJapaneseReading` pasan. |
| **4 · Repaso y viaje** | SRS completo, pantalla Repaso, dojo de kana, Grimorio, Modo viaje con «Enseñar al personal» y calculadora. Perfil con calendario y cuenta atrás. | Del 2 al 16 de noviembre la app abre en el Modo viaje, y funciona en modo avión. |
| **5 · Pulido** | Accesibilidad, rendimiento, exportar e importar, onboarding, revisión visual en 390×844 y 360×780 con ambos temas. | Lighthouse ≥ 90 en PWA y Accesibilidad. Sin errores en la consola. |

---

## 18. Despliegue e instalación

1. Repositorio en GitHub (público o privado con Pages habilitado).
2. Workflow `.github/workflows/deploy.yml`: en cada push a `main`, `npm ci && npm test && npm run build`, y publicación de `dist/` en GitHub Pages. Configura `base` en `vite.config.ts` con el nombre del repositorio.
3. Al terminar, escríbeme los pasos para instalarla:
   - **iPhone:** abrir la URL en Safari → Compartir → «Añadir a pantalla de inicio».
   - **Android:** abrir en Chrome → menú → «Instalar aplicación».
4. Las actualizaciones del service worker se aplican con un aviso «Hay una versión nueva · Actualizar», sin perder el progreso.

---

## 19. Cómo quiero que trabajes

1. **Antes de programar**, resume en 10 líneas lo que has entendido y crea `CLAUDE.md` con las decisiones clave, las convenciones y la lista de fases. Después escribe un **plan de diseño breve** (paleta, tipografía, wireframe ASCII del mapa y de una pantalla de ejercicio). Revísalo contra la sección 3: si algo parece genérico (tarjetas idénticas con sombra gris, degradados decorativos, etiquetas en mayúsculas), corrígelo y dime qué has cambiado.
2. **Trabaja fase a fase.** Al terminar cada una: `npm run build`, `npm test`, un commit con un mensaje claro y un resumen para mí de lo que ya funciona y cómo probarlo en el móvil.
3. **Pregúntame solo si algo te bloquea.** Para decisiones menores, elige lo más sencillo, apúntalo en `CLAUDE.md` y sigue.
4. **No inventes contenido japonés.** Si necesitas una frase nueva (por ejemplo, un distractor), márcala con `generated: true` y enuméramela al final de la fase para que la revise.
5. **Revisa visualmente** si puedes (capturas con Playwright a 390×844 en ambos temas) y corrige lo que se vea mal antes de dar una fase por cerrada.
6. **Nada de dependencias innecesarias.** Antes de añadir una librería que no esté en la sección 2, justifícala en una línea.
7. **Propiedad intelectual:** recuerda la sección 3.1. Ante la duda, haz algo original.
