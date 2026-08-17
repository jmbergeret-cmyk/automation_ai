#!/usr/bin/env python3
"""Genera el sub-workflow de captura de ideas, para llamar como herramienta desde el agente asistente."""
import json

BASE_ID = "appieVX1O0rtYjQnp"
TBL_IDEAS = "tbl6ztfNUCkrvj3aG"
CRED_OPENAI = {"openAiApi": {"id": "51oN9QrCM5ZMZ1Zu", "name": "OpenAi account"}}
CRED_AT = {"airtableTokenApi": {"id": "5OeGw1N7Cd3K8Fwk", "name": "Airtable Personal Access Token account 2"}}

SYSTEM = (
    "Sos un asistente que convierte notas sueltas de Juan en filas estructuradas de su base de "
    "ideas de negocio. Devolves SOLO un objeto JSON con estas claves exactas: idea, one_liner, "
    "vertical, tipo, notas.\\n"
    "Reglas:\\n"
    "- 'idea': titulo corto y concreto, maximo 8 palabras, nunca una oracion completa.\\n"
    "- 'one_liner': que problema resuelve, en una sola linea. Si la nota no lo aclara, infieri lo "
    "mas razonable y escribilo igual.\\n"
    "- 'vertical': exactamente uno de estos valores: Gastronomia, Real Estate, IA & Automatizacion, Otro.\\n"
    "- 'tipo': exactamente uno de estos valores: Producto, Servicio, Contenido, Mejora interna, Inversion.\\n"
    "- 'notas': el desarrollo de la idea en 2 a 4 oraciones, ampliando lo que dijo Juan SIN inventar "
    "datos de mercado, cifras ni nombres de competidores.\\n"
    "Nunca puntues la idea ni opines si es buena: de eso se encarga otro proceso. Si la nota es "
    "demasiado vaga para ser una idea de negocio, devolve el JSON igual y aclara en 'notas' que la "
    "captura fue ambigua."
)

CODE = r"""// Valida la respuesta del modelo antes de escribir en Airtable.
// Los campos singleSelect rechazan cualquier valor fuera de su lista, asi que
// normalizamos aca: un valor invalido cae al fallback en vez de romper el flujo.

const respuesta = $input.first().json;
const contenido = respuesta.choices?.[0]?.message?.content;
if (!contenido) {
  throw new Error('OpenAI no devolvio contenido: ' + JSON.stringify(respuesta).slice(0, 300));
}

let idea;
try {
  idea = JSON.parse(contenido);
} catch (e) {
  throw new Error('La respuesta del modelo no era JSON valido: ' + contenido.slice(0, 300));
}

const VERTICALES = ['Gastronomia', 'Real Estate', 'IA & Automatizacion', 'Otro'];
const TIPOS = ['Producto', 'Servicio', 'Contenido', 'Mejora interna', 'Inversion'];

// Comparacion sin acentos ni mayusculas: no queremos depender de que el modelo
// escriba los acentos igual que las opciones de Airtable.
const normalizar = (s) => (s ?? '').toString().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const elegir = (valor, opciones, fallback) => {
  const v = normalizar(valor);
  return opciones.find((o) => normalizar(o) === v) ?? fallback;
};

// Los nombres reales de las opciones en Airtable, con acentos.
const VERTICAL_REAL = {
  'Gastronomia': 'Gastronomía',
  'IA & Automatizacion': 'IA & Automatización',
};
const TIPO_REAL = { 'Inversion': 'Inversión' };

const vertical = elegir(idea.vertical, VERTICALES, 'Otro');
const tipo = elegir(idea.tipo, TIPOS, 'Producto');
const textoOriginal = ($('Recibe la idea').first().json.texto ?? '').toString();

return [{
  json: {
    'Idea': (idea.idea || textoOriginal.slice(0, 60) || 'Sin titulo').toString().slice(0, 255),
    'One-liner': (idea.one_liner || '').toString(),
    'Notas': (idea.notas || '').toString(),
    'Captura raw': textoOriginal,
    'Estado': 'Inbox',
    'Vertical': VERTICAL_REAL[vertical] ?? vertical,
    'Tipo': TIPO_REAL[tipo] ?? tipo,
    'Fuente': 'Voz / Telegram',
  },
}];
"""

JSON_BODY = (
    '={\n'
    '  "model": "gpt-4o-mini",\n'
    '  "temperature": 0.2,\n'
    '  "response_format": { "type": "json_object" },\n'
    '  "messages": [\n'
    '    { "role": "system", "content": "' + SYSTEM + '" },\n'
    '    { "role": "user", "content": {{ JSON.stringify($json.texto) }} }\n'
    '  ]\n'
    '}'
)

nodes = [
    {
        "parameters": {
            "inputSource": "workflowInputs",
            "workflowInputs": {"values": [{"name": "texto", "type": "string"}]},
        },
        "type": "n8n-nodes-base.executeWorkflowTrigger",
        "typeVersion": 1.1,
        "position": [0, 400],
        "id": "e1000000-0000-4000-8000-000000000001",
        "name": "Recibe la idea",
    },
    {
        "parameters": {
            "method": "POST",
            "url": "https://api.openai.com/v1/chat/completions",
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "openAiApi",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": JSON_BODY,
            "options": {},
        },
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [220, 400],
        "id": "e1000000-0000-4000-8000-000000000002",
        "name": "Estructurar idea",
        "credentials": CRED_OPENAI,
    },
    {
        "parameters": {"jsCode": CODE},
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [440, 400],
        "id": "e1000000-0000-4000-8000-000000000003",
        "name": "Preparar fila",
    },
    {
        "parameters": {
            "operation": "create",
            "base": {"__rl": True, "value": BASE_ID, "mode": "id"},
            "table": {"__rl": True, "value": TBL_IDEAS, "mode": "id"},
            "columns": {
                "mappingMode": "autoMapInputData",
                "value": {},
                "matchingColumns": [],
                "schema": [],
                "attemptToConvertTypes": False,
                "convertFieldsToString": False,
            },
            "options": {},
        },
        "type": "n8n-nodes-base.airtable",
        "typeVersion": 2.1,
        "position": [660, 400],
        "id": "e1000000-0000-4000-8000-000000000004",
        "name": "Guardar en Airtable",
        "credentials": CRED_AT,
    },
    {
        "parameters": {
            "assignments": {"assignments": [{
                "id": "f1000000-0000-4000-8000-000000000001",
                "name": "respuesta",
                "value": "=Idea guardada en Inbox: \"{{ $('Preparar fila').item.json.Idea }}\" ({{ $('Preparar fila').item.json.Vertical }} / {{ $('Preparar fila').item.json.Tipo }}). Resumen: {{ $('Preparar fila').item.json['One-liner'] }}",
                "type": "string",
            }]},
            "includeOtherFields": False,
            "options": {},
        },
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [880, 400],
        "id": "e1000000-0000-4000-8000-000000000005",
        "name": "Respuesta para el agente",
    },
    {
        "parameters": {
            "content": "## Como enchufar esto al asistente\n\nEn el workflow de tu bot asistente, agrega un nodo **Call n8n Workflow Tool** colgando del AI Agent (conexion `ai_tool`) y configuralo asi:\n\n- **Workflow**: este mismo\n- **Name**: `guardar_idea`\n- **Description**: `Guarda una idea de negocio de Juan en su base de Airtable. Usar cuando Juan diga que quiere anotar, guardar o registrar una idea. Pasar en 'texto' lo que dijo, completo y sin resumir.`\n- **texto**: dejalo que lo complete el modelo\n\nNo agregues un Telegram Trigger aca: el mensaje ya entra por el trigger del asistente. Telegram permite un solo webhook por bot.",
            "height": 400,
            "width": 420,
        },
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": [-40, -60],
        "id": "e1000000-0000-4000-8000-000000000006",
        "name": "Wiring",
    },
    {
        "parameters": {
            "content": "## Que NO llena esta pieza\n\n**Energia**: la ponés vos en el triaje semanal.\n\n**Scores e investigacion**: los llena el agente semanal.\n\nToda idea entra como **Inbox**. *Captura raw* guarda el texto original tal cual lo paso el agente, para auditar que se perdio en el camino.",
            "height": 300,
            "width": 380,
        },
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": [640, -60],
        "id": "e1000000-0000-4000-8000-000000000007",
        "name": "Alcance",
    },
]

connections = {
    "Recibe la idea": {"main": [[{"node": "Estructurar idea", "type": "main", "index": 0}]]},
    "Estructurar idea": {"main": [[{"node": "Preparar fila", "type": "main", "index": 0}]]},
    "Preparar fila": {"main": [[{"node": "Guardar en Airtable", "type": "main", "index": 0}]]},
    "Guardar en Airtable": {"main": [[{"node": "Respuesta para el agente", "type": "main", "index": 0}]]},
}

workflow = {
    "name": "SW_Guardar_Idea",
    "nodes": nodes,
    "connections": connections,
    "pinData": {},
    "settings": {"executionOrder": "v1"},
    "active": False,
    "tags": [],
}

out = "/tmp/claude-0/-home-user-automation-ai/71aa7dac-f9df-50a9-9ad3-3329e416e25d/scratchpad/SW_Guardar_Idea.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)
print("escrito:", out)
