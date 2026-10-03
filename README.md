# Kotodama 言霊

App móvil (PWA) para aprender **japonés de supervivencia** en cuatro semanas, al estilo Duolingo:
un camino de unidades por un bosque con magia, lecciones cortas, maná, racha, vidas, repasos y un
Modo viaje que funciona sin conexión. Interfaz en español; pensada para el viaje a Japón del
2 al 16 de noviembre de 2026 (entrenamiento del 3 de octubre al 1 de noviembre).

**App:** https://gaussiano.github.io/kotodama/

## Instalar en el móvil

- **Android:** abre la URL en **Chrome** → menú ⋮ → **«Instalar aplicación»** (o «Añadir a pantalla
  de inicio»). Se abre a pantalla completa, funciona sin conexión y el micrófono reconoce japonés.
  También hay un **APK** en [Releases](https://github.com/Gaussiano/kotodama/releases) (requiere
  permitir «orígenes desconocidos»); la PWA es la opción recomendada.
- **iPhone:** abre la URL en **Safari** → Compartir → **«Añadir a pantalla de inicio»**.

Si no suena la voz japonesa: iPhone → Ajustes → Accesibilidad → Contenido leído → Voces → Japonés;
Android → ajustes de texto a voz de Google → instalar datos de japonés.

Las actualizaciones llegan solas: aparece «Hay una versión nueva · Actualizar» y el progreso se conserva.
Haz copias con **Ajustes → Exportar progreso** (JSON) de vez en cuando.

## Qué hay dentro

- **Mapa:** 5 regiones (campamento, pueblo, taberna, mercado, gran viaje), 30 nodos y 5 guardianes,
  con la fecha recomendada de cada uno («Hoy toca»).
- **15 tipos de ejercicio:** tarjetas, elegir, escuchar, construir, escribir (romaji o kana), emparejar,
  «¿Qué contestas?», situaciones, decirlo en voz alta, kana, precios, horas, carteles y escenas.
- **Hablar:** pronunciación por tema con el micrófono y conversaciones completas en tres niveles
  (elegir · hablar · escribir).
- **Repaso:** repetición espaciada de 5 cajas, repaso de errores y recuperación de corazones.
- **Dojo de kana**, **Grimorio** (todas las frases, favoritos, audio lento) y **Modo viaje**
  («Enseñar al personal», calculadora de yenes, emergencias).

## Desarrollo

```
npm install
npm run dev        # http://localhost:5173/kotodama/
npm test           # vitest
npm run build      # tsc + vite build → dist/
node scripts/shots.mjs       # capturas 390×844 en ambos temas (tras build)
node scripts/lighthouse.mjs  # auditoría Lighthouse (tras build)
```

Las fuentes japonesas están subconjuntadas a los glifos usados con `python scripts/subset-fonts.py`
(ver docstring). La especificación completa está en `docs/SPEC.md`; las decisiones, en `CLAUDE.md`.

## Licencias

Código del proyecto: MIT. Fuentes: Shippori Mincho B1, Klee One, M PLUS Rounded 1c y Nunito, bajo
la SIL Open Font License. Todo el arte (mascota, mapa, círculos, sellos) es original.
