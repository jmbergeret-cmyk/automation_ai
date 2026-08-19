# Base de ideas de negocio

Sistema personal de Juan para capturar, enriquecer y priorizar ideas de negocio.
Nada de esto es material del curso: es tooling propio que vive en esta rama.

## Estado actual

| Pieza | Estado |
|---|---|
| Base de Airtable | **Creada y poblada.** `appieVX1O0rtYjQnp`, workspace "Desarrollo personal" |
| Sub-workflow de captura | **Armado, sin probar.** `SW_Guardar_Idea.json`, falta importar y enchufar al asistente |
| Agente semanal | **No empezado.** Dedupe, investigación web, scoring y digest por mail |
| Tabla `Videos y cursos` | **Diseñada, sin crear.** El conector de Airtable se cayó a mitad de sesión |

## Por qué existe

La base anterior vivía en Notion (`Ideas de negocio`, dentro de *Cerebro digital*) y
tenía **1 idea en 3 años**. El diagnóstico no fue la herramienta sino la fricción de
captura y la ausencia de un ritual de revisión. De ahí las dos decisiones de diseño
que atraviesan todo esto:

1. **La captura tiene que costar menos que no capturar.** Por eso entra por voz al bot
   de Telegram que Juan ya usa, no por una app más.
2. **El humano decide, el agente investiga.** El campo `Energía` lo llena Juan y nadie
   más. Una base llena de ideas puntuadas por una máquina que a Juan no le importan es
   exactamente el fracaso anterior con más pasos.

## La base de Airtable

Base `appieVX1O0rtYjQnp` — https://airtable.com/appieVX1O0rtYjQnp

| Tabla | ID | Para qué |
|---|---|---|
| `Ideas` | `tbl6ztfNUCkrvj3aG` | Una fila por idea. 29 campos |
| `Competidores` | `tblcwCHRhhvBtlrO0` | Lo que el agente encuentra investigando |
| `Corridas` | `tblkYWQMJzsygbK6I` | Log de cada ejecución del agente |
| `Criterios` | `tblBUpyevkewlHyUu` | Pesos del scoring, editables sin tocar n8n |

`airtable_ideas_schema.json` tiene el schema completo con las descripciones de cada campo.

### Quién escribe qué en `Ideas`

- **El flujo de captura**: `Idea`, `One-liner`, `Notas`, `Captura raw`, `Estado` (siempre
  `Inbox`), `Vertical`, `Tipo`, `Fuente`.
- **Juan, en el triaje semanal**: `Energía`. Nada más, y nadie más.
- **El agente semanal** (todavía no existe): `Fit estratégico`, `Tamaño de oportunidad`,
  `Esfuerzo de arranque`, `Confianza del score`, `Capital requerido`, `Time to revenue`,
  `Ventaja injusta`, `Investigado el`, `Resumen de mercado`, `Veredicto del agente`,
  `Próximo paso sugerido`, `Fuentes`, `Duplicada de`, y las tablas `Competidores` y `Corridas`.

`Score total` es una fórmula, no un campo escrito:

```
IF(AND({Fit estratégico}, {Tamaño de oportunidad}, {Esfuerzo de arranque}),
   ROUND(({Fit estratégico} * 0.35 + {Tamaño de oportunidad} * 0.20
        + {Esfuerzo de arranque} * 0.20
        + SWITCH({Energía}, "Me prende", 5, "Tibia", 3, "Fría", 1, 0) * 0.25) * 2, 1),
   BLANK())
```

Los pesos están duplicados en la tabla `Criterios` para que se puedan leer y editar desde
n8n. **Si cambiás uno, hay que cambiar el otro**: Airtable no lee los pesos de la tabla.

### Vistas

Todavía no existen — la API de Airtable no crea vistas, van a mano:

| Vista | Filtro |
|---|---|
| Inbox | `Estado = Inbox` |
| Para triar | `Estado = Enriquecida` y `Energía` vacío |
| Top 10 | `Estado` en Triaje/Explorando/Validando, orden por `Score total` desc |
| Por vertical | Kanban por `Vertical` |
| Radar | `Estado = Explorando` y `Última actualización` hace +30 días |
| Cementerio | `Estado = Descartada`, mostrando `Motivo de descarte` |

## Los workflows

### `SW_Guardar_Idea.json` — el que va

Sub-workflow que se llama como herramienta desde el agente del bot asistente que Juan
ya tiene. 5 nodos: recibe `texto` → estructura con GPT → valida → escribe en Airtable →
devuelve una confirmación en texto.

Para enchufarlo, en el workflow del asistente va un nodo **Call n8n Workflow Tool**
(`@n8n/n8n-nodes-langchain.toolWorkflow` v2.2) colgado del AI Agent por `ai_tool`:

- **Name**: `guardar_idea`
- **Description**: `Guarda una idea de negocio de Juan en su base de Airtable. Usar cuando Juan diga que quiere anotar, guardar o registrar una idea. Pasar en 'texto' lo que dijo, completo y sin resumir.`

No lleva transcripción: el asistente de Juan ya maneja notas de voz, así que el `texto`
llega transcripto.

### `Captura_Ideas_Telegram.json` — alternativa descartada

Workflow independiente con su propio Telegram Trigger, transcripción por Whisper y todo
el circuito. Se descartó porque **Telegram permite un solo webhook por token de bot**:
tenerlo activo junto al asistente sobre el mismo bot hace que uno de los dos deje de
recibir mensajes en silencio. Queda como referencia, o para el día que Juan quiera un
bot dedicado.

## Convenciones de n8n de esta instancia

Sacadas de los templates en `07.templates/01.n8n_flows/`. Las versiones de nodo del
JSON coinciden con estas a propósito, para que el import no tire warnings:

| Nodo | typeVersion |
|---|---|
| `telegramTrigger`, `telegram` | 1.2 |
| `if` | 2.2 |
| `set` | 3.4 |
| `code` | 2 |
| `httpRequest` | 4.2 |
| `airtable`, `airtableTool` | 2.1 |
| `executeWorkflowTrigger` | 1.1 |
| `toolWorkflow` | 2.2 |

Credenciales existentes, cableadas por ID en los JSON:

| Tipo | ID | Nombre |
|---|---|---|
| `openAiApi` | `51oN9QrCM5ZMZ1Zu` | OpenAi account |
| `airtableTokenApi` | `5OeGw1N7Cd3K8Fwk` | Airtable Personal Access Token account 2 |
| `telegramApi` | `IcSOnEUcm0gcBPjo` | Telegram account (la usa `G_CRM` — no reutilizar para ideas) |

## Riesgos conocidos, sin verificar

Nada de esto se pudo probar contra la instancia real: la sesión donde se armó tenía
bloqueado el dominio de n8n por política de egreso.

- **`Guardar en Airtable` usa `autoMapInputData`.** Mapea por nombre de campo exacto.
  Si algún nombre no coincide, falla ahí. Es el punto más probable de ruptura.
- **`executeWorkflowTrigger` con `inputSource: "workflowInputs"`.** La forma del
  parámetro se dedujo, no se verificó contra la instancia. Si n8n pide reconfigurar el
  nodo, se arregla en la UI declarando un input `texto` de tipo string.
- **`Captura raw` puede quedar pobre.** El agente del asistente es un intermediario que
  tiende a resumir. Si pasa, la solución es una línea en el system prompt del asistente:
  *"Cuando Juan te dicte una idea, pasá a guardar_idea la transcripción completa y
  literal, sin resumir ni reformular."*

## Tabla `Videos y cursos` (pendiente de crear)

Cola de contenido para ver después, en la misma base. Schema en
`tabla_videos_schema.json`, se crea con `crear_tabla_videos.py`.

Tres decisiones de diseño:

- **`Por qué me interesa` se escribe al guardar, no después.** Mismo rol que el
  `One-liner` de `Ideas`: una lista de 60 links sin contexto no se revisa, se abandona.
- **`Duración (min)` habilita la vista "Tengo 20 minutos".** El momento de tener ganas
  de ver algo rara vez coincide con tener una hora libre; filtrar por tiempo disponible
  es lo que hace que la cola se consuma.
- **`Idea que generó` linkea a `Ideas`.** Cierra el circuito: contenido → idea →
  investigación del agente semanal.

`Tema` es multi-select a propósito: un video de IA aplicada a inmobiliarias es las dos
cosas, y forzar una sola categoría lo pierde cuando buscás por la otra.

Vistas pendientes (van a mano): Por ver · Tengo 20 minutos · Viendo · Cosecha
(`Estado = Visto` y `Accionable` no vacío) · Cementerio.

## Scripts

- `build_subflow.py` — genera `SW_Guardar_Idea.json`
- `build_flow.py` — genera `Captura_Ideas_Telegram.json`
- `crear_base_airtable.py` — recrea la base de Airtable desde `airtable_ideas_schema.json`
  vía API REST. Ya se ejecutó; queda por si hay que rehacerla desde cero
- `crear_tabla_videos.py` — agrega la tabla `Videos y cursos` a la base existente.
  Todavía no se ejecutó. Es idempotente: si la tabla ya existe, no la duplica
- `PROMPT_sesion_nueva.md` — handoff con todo el contexto, para arrancar una sesión
  nueva que sí pueda llegar a la API de n8n

Los JSON se editan regenerándolos con estos scripts, no a mano.

## Lo que sigue

El **agente semanal**, que todavía no existe. Corre por cron, y para cada idea en `Inbox`:

1. Deduplica contra lo ya cargado (dedupe semántico con embeddings, en Supabase pgvector;
   Airtable solo guarda el link `Duplicada de`)
2. Investiga en la web: ¿existe? ¿competidores? ¿tamaño de mercado?
3. Puntúa contra los pesos de `Criterios` y pasa la idea a `Enriquecida`
4. Escribe una fila en `Corridas` con lo que hizo y cuánto costó
5. Manda un digest por mail con las 3 mejores y el próximo paso de cada una

Recomendación pendiente: dejar correr la captura una o dos semanas antes de armarlo, para
calibrar los pesos contra ideas reales en vez de adivinarlos.
