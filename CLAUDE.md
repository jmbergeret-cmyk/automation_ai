# automation_ai

Repo de Juan (Saladbowl, Montevideo) con material de curso y los proyectos
propios. Juan escribe en español rioplatense; contestarle igual, con voseo.

## Proyectos activos

- `saladbowl-web/` — sitio de Saladbowl (Astro + Tailwind + GSAP). Producción
  en `saladbowl.com.uy` vía Vercel desde `main`. Cómo deployar y dónde se
  editan los datos: `saladbowl-web/DEPLOY.md`.
- `saladbowl-redes/` — agente de contenido para Instagram/Facebook.
  Especificación completa y fases: `saladbowl-redes/PLAN.md`. Leerlo entero
  antes de tocar nada.

## Reglas que Juan ya marcó

- **Nunca inventar datos**: platos, ingredientes, precios, promos, claims.
  Todo sale de `saladbowl-web/src/data/`. Si falta, se pregunta.
- Fotos siempre reales; nada de comida generada por IA.
- El diseño de la web (Lato, verde/crema/rosado, aire, foto protagonista) es
  la referencia para cualquier pieza.
- Trabajar en una rama `claude/...`; a `main` solo con su OK explícito.
- Los previews se le muestran como Artifacts (no puede abrir el contenedor).
