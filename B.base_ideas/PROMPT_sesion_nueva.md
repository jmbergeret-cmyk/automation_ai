Estoy armando mi sistema personal para capturar y priorizar ideas de negocio. Vengo de otra sesión donde quedó bastante avanzado; te paso el estado completo. Adjunto dos archivos JSON de esa sesión: `SW_Guardar_Idea.json` y `Captura_Ideas_Telegram.json`.

Importante: en esa sesión el dominio de mi n8n estaba bloqueado por la política de egreso, así que **nada de los workflows se pudo probar contra la instancia real**. Ahora ya lo autoricé, así que podés llegar directo a `https://juanautomatationai.app.n8n.cloud/` — verificá vos mismo en vez de pedirme que te pase mensajes de error.

---

## Lo que YA está hecho

**Base de Airtable, creada y poblada** — `appieVX1O0rtYjQnp`, workspace "Desarrollo personal"
https://airtable.com/appieVX1O0rtYjQnp

| Tabla | ID |
|---|---|
| `Ideas` | `tbl6ztfNUCkrvj3aG` |
| `Competidores` | `tblcwCHRhhvBtlrO0` |
| `Corridas` | `tblkYWQMJzsygbK6I` |
| `Criterios` | `tblBUpyevkewlHyUu` |

Campos de `Ideas` (29): Idea, One-liner, Notas, Captura raw, Estado, Energía, Vertical, Tipo, Fit estratégico, Tamaño de oportunidad, Esfuerzo de arranque, Confianza del score, Capital requerido, Time to revenue, Ventaja injusta, Score total, Fuente, Link, Adjuntos, Investigado el, Resumen de mercado, Veredicto del agente, Próximo paso sugerido, Fuentes, Motivo de descarte, Duplicada de, Duplicados de esta, Competidores, Corrida, Fecha captura, Última actualización.

Opciones de los selects:
- **Estado**: Inbox, Enriquecida, Triaje, Explorando, Validando, En marcha, Descartada, Duplicada
- **Energía**: Me prende, Tibia, Fría
- **Vertical**: Gastronomía, Real Estate, IA & Automatización, Otro
- **Tipo**: Producto, Servicio, Contenido, Mejora interna, Inversión
- **Fuente**: Voz / Telegram, Manual, Web / Lectura, Conversación, Agente
- **Confianza del score**: Alta, Media, Baja

Ya cargados: los 4 criterios de scoring con sus definiciones, y una idea migrada de Notion ("Inmobiliaria digital", en Inbox).

`Score total` es una fórmula, no un campo escrito:
```
IF(AND({Fit estratégico}, {Tamaño de oportunidad}, {Esfuerzo de arranque}),
   ROUND(({Fit estratégico} * 0.35 + {Tamaño de oportunidad} * 0.20
        + {Esfuerzo de arranque} * 0.20
        + SWITCH({Energía}, "Me prende", 5, "Tibia", 3, "Fría", 1, 0) * 0.25) * 2, 1),
   BLANK())
```
Los pesos están duplicados en la tabla `Criterios` para poder leerlos desde n8n. Si se cambia uno hay que cambiar el otro: Airtable no los lee de la tabla.

---

## Las dos reglas de diseño que no se negocian

1. **`Energía` la lleno yo y nadie más.** Ningún agente escribe ese campo. Es el filtro humano. Mi base anterior en Notion tenía 1 idea en 3 años; llenarla de filas puntuadas por una máquina que no me importan sería el mismo fracaso con más pasos.
2. **Toda idea entra como `Inbox`.** El flujo de captura no puntúa ni opina. Eso es trabajo del agente semanal.

Quién escribe qué en `Ideas`:
- **Captura**: Idea, One-liner, Notas, Captura raw, Estado (siempre Inbox), Vertical, Tipo, Fuente
- **Yo, en el triaje semanal**: Energía
- **Agente semanal** (no existe todavía): Fit estratégico, Tamaño de oportunidad, Esfuerzo de arranque, Confianza del score, Capital requerido, Time to revenue, Ventaja injusta, Investigado el, Resumen de mercado, Veredicto del agente, Próximo paso sugerido, Fuentes, Duplicada de, y las tablas Competidores y Corridas

---

## Lo que FALTA

### 1. Poner a andar `SW_Guardar_Idea.json` (prioridad)

Es un sub-workflow de 5 nodos que se llama como herramienta desde el agente de mi bot asistente de Telegram: recibe `texto` → estructura con GPT (`gpt-4o-mini`, response_format json_object) → valida en un Code node → escribe en Airtable → devuelve confirmación.

**No tiene Telegram Trigger propio a propósito**: Telegram permite un solo webhook por token de bot. Si tuviera trigger propio y lo activo junto a mi asistente sobre el mismo bot, uno de los dos deja de recibir mensajes en silencio. Tampoco lleva transcripción, porque mi asistente ya maneja notas de voz.

Falta:
- Importarlo a n8n y guardarlo
- Asignarle 2 credenciales: `OpenAi account` (nodo *Estructurar idea*) y `Airtable Personal Access Token account 2` (nodo *Guardar en Airtable*)
- En el workflow de mi asistente, agregar un nodo **Call n8n Workflow Tool** (`@n8n/n8n-nodes-langchain.toolWorkflow` v2.2) colgado del AI Agent por conexión `ai_tool`, con:
  - **Name**: `guardar_idea`
  - **Description**: `Guarda una idea de negocio de Juan en su base de Airtable. Usar cuando Juan diga que quiere anotar, guardar o registrar una idea. Pasar en 'texto' lo que dijo, completo y sin resumir.`
- Probarlo de punta a punta y arreglar lo que rompa

### 2. Crear las vistas en Airtable (la API no las crea, van a mano)

| Vista | Filtro |
|---|---|
| Inbox | `Estado = Inbox` |
| Para triar | `Estado = Enriquecida` y `Energía` vacío |
| Top 10 | `Estado` en Triaje/Explorando/Validando, orden por `Score total` desc |
| Por vertical | Kanban agrupado por `Vertical` |
| Radar | `Estado = Explorando` y `Última actualización` hace +30 días |
| Cementerio | `Estado = Descartada`, mostrando `Motivo de descarte` |

### 3. El agente semanal (todavía no empezado)

Corre por cron. Para cada idea en `Inbox`:
1. Deduplica contra lo ya cargado (dedupe semántico con embeddings en Supabase pgvector, que ya tengo conectado; Airtable solo guarda el link `Duplicada de`)
2. Investiga en la web: ¿ya existe? ¿competidores? ¿tamaño de mercado?
3. Puntúa según los pesos de `Criterios` y pasa la idea a `Enriquecida`
4. Escribe una fila en `Corridas` con qué hizo, cuánto costó y qué falló
5. Me manda un digest por mail con las 3 mejores y el próximo paso concreto de cada una

La recomendación que me dieron y que comparto: **dejar correr la captura una o dos semanas antes de armar esto**, para calibrar los pesos contra ideas reales mías en vez de adivinarlos. No lo armes todavía salvo que te lo pida.

---

## Riesgos conocidos, sin verificar

- **El nodo `Guardar en Airtable` usa `autoMapInputData`**, que mapea por nombre de campo exacto. Es el punto más probable de ruptura. Los nombres que emite el Code node son: `Idea`, `One-liner`, `Notas`, `Captura raw`, `Estado`, `Vertical`, `Tipo`, `Fuente`.
- **El `executeWorkflowTrigger` usa `inputSource: "workflowInputs"`** con un input `texto` de tipo string. La forma exacta del parámetro se dedujo, no se verificó. Si n8n pide reconfigurar el nodo, se declara el input a mano en la UI.
- **`Captura raw` puede quedar pobre.** Como ahora el texto pasa por el agente de mi asistente, y los agentes tienden a resumir, puede que no guarde la transcripción literal. Si pasa, la solución es agregar una línea al system prompt de mi asistente: *"Cuando Juan te dicte una idea, pasá a guardar_idea la transcripción completa y literal, sin resumir ni reformular."*

---

## Convenciones de mi instancia de n8n

Las versiones de nodo de los JSON coinciden con las de mis workflows existentes a propósito, para que el import no tire warnings:

`telegramTrigger` 1.2 · `telegram` 1.2 · `if` 2.2 · `set` 3.4 · `code` 2 · `httpRequest` 4.2 · `airtable` 2.1 · `airtableTool` 2.1 · `executeWorkflowTrigger` 1.1 · `toolWorkflow` 2.2

Credenciales que ya existen, cableadas por ID en los JSON:

| Tipo | ID | Nombre |
|---|---|---|
| `openAiApi` | `51oN9QrCM5ZMZ1Zu` | OpenAi account |
| `airtableTokenApi` | `5OeGw1N7Cd3K8Fwk` | Airtable Personal Access Token account 2 |
| `telegramApi` | `IcSOnEUcm0gcBPjo` | Telegram account — **la usa el workflow `G_CRM`, no reutilizar para ideas** |

Ojo: esos IDs salieron de los templates de mi repo `automation_ai` (carpeta `07.templates/01.n8n_flows/`). Puede que en el proyecto "Personal" de mi instancia no resuelvan y haya que reasignarlos desde el desplegable.

---

## Sobre el segundo archivo adjunto

`Captura_Ideas_Telegram.json` es una **alternativa que descarté**: workflow independiente con su propio Telegram Trigger y transcripción por Whisper. Se descartó por lo del webhook único por bot. Te lo paso solo como referencia por si algún día quiero un bot dedicado. **No lo importes.**

---

## Qué quiero que hagas ahora

Arrancá por el punto 1: importá `SW_Guardar_Idea.json` a mi n8n usando la API, dejalo configurado, probalo de punta a punta contra la base de Airtable y arreglá lo que falle. Contame qué encontraste. Si algo del diseño te parece mal pensado, decímelo antes de cambiarlo.
