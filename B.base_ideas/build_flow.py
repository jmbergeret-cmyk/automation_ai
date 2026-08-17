#!/usr/bin/env python3
"""Genera el workflow n8n de captura de ideas por Telegram."""
import json

BASE_ID = "appieVX1O0rtYjQnp"
TBL_IDEAS = "tbl6ztfNUCkrvj3aG"
CRED_TG = {"telegramApi": {"id": "IcSOnEUcm0gcBPjo", "name": "Telegram account"}}
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
// normalizamos aca: un valor invalido cae a "Otro" en vez de romper el flujo.

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

// Comparacion sin acentos ni mayusculas: el modelo escribe "Gastronomía" y la
// opcion de Airtable tambien, pero no queremos depender de que coincidan exacto.
const normalizar = (s) => (s ?? '').toString().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const elegir = (valor, opciones, fallback) => {
  const v = normalizar(valor);
  return opciones.find((o) => normalizar(o) === v) ?? fallback;
};

// Los nombres reales de los campos en Airtable, con acentos.
const VERTICAL_REAL = {
  'Gastronomia': 'Gastronomía',
  'IA & Automatizacion': 'IA & Automatización',
};
const TIPO_REAL = { 'Inversion': 'Inversión' };

const vertical = elegir(idea.vertical, VERTICALES, 'Otro');
const tipo = elegir(idea.tipo, TIPOS, 'Producto');
const textoOriginal = $('Normalizar texto').first().json.texto;

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


def cond(id_, left, right, op_type="string", operation="equals"):
    return {
        "id": id_,
        "leftValue": left,
        "rightValue": right,
        "operator": {"type": op_type, "operation": operation},
    }


nodes = [
    {
        "parameters": {"updates": ["message"], "additionalFields": {}},
        "type": "n8n-nodes-base.telegramTrigger",
        "typeVersion": 1.2,
        "position": [-160, 400],
        "id": "a1000000-0000-4000-8000-000000000001",
        "name": "Telegram Trigger",
        "webhookId": "b1000000-0000-4000-8000-000000000001",
        "credentials": CRED_TG,
    },
    {
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
                "conditions": [cond(
                    "c1000000-0000-4000-8000-000000000001",
                    "={{ String($json.message.from.id) }}",
                    "TU_CHAT_ID",
                )],
                "combinator": "and",
            },
            "looseTypeValidation": True,
            "options": {},
        },
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [60, 400],
        "id": "a1000000-0000-4000-8000-000000000002",
        "name": "Solo Juan",
    },
    {
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
                "conditions": [{
                    "id": "c1000000-0000-4000-8000-000000000002",
                    "leftValue": "={{ $json.message.voice }}",
                    "rightValue": "",
                    "operator": {"type": "object", "operation": "exists", "singleValue": True},
                }],
                "combinator": "and",
            },
            "looseTypeValidation": True,
            "options": {},
        },
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [280, 400],
        "id": "a1000000-0000-4000-8000-000000000003",
        "name": "Es audio?",
    },
    {
        "parameters": {
            "resource": "file",
            "fileId": "={{ $json.message.voice.file_id }}",
            "download": True,
        },
        "type": "n8n-nodes-base.telegram",
        "typeVersion": 1.2,
        "position": [520, 260],
        "id": "a1000000-0000-4000-8000-000000000004",
        "name": "Bajar audio",
        "credentials": CRED_TG,
    },
    {
        "parameters": {
            "method": "POST",
            "url": "https://api.openai.com/v1/audio/transcriptions",
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "openAiApi",
            "contentType": "multipart-form-data",
            "sendBody": True,
            "bodyParameters": {
                "parameters": [
                    {"parameterType": "formBinaryData", "name": "file", "inputDataFieldName": "data"},
                    {"name": "model", "value": "whisper-1"},
                    {"name": "language", "value": "es"},
                ]
            },
            "options": {},
        },
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [740, 260],
        "id": "a1000000-0000-4000-8000-000000000005",
        "name": "Transcribir",
        "credentials": CRED_OPENAI,
    },
    {
        "parameters": {
            "assignments": {"assignments": [{
                "id": "d1000000-0000-4000-8000-000000000001",
                "name": "texto",
                "value": "={{ $json.text }}",
                "type": "string",
            }]},
            "options": {},
        },
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [960, 260],
        "id": "a1000000-0000-4000-8000-000000000006",
        "name": "Texto desde voz",
    },
    {
        "parameters": {
            "assignments": {"assignments": [{
                "id": "d1000000-0000-4000-8000-000000000002",
                "name": "texto",
                "value": "={{ $json.message.text }}",
                "type": "string",
            }]},
            "options": {},
        },
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [520, 540],
        "id": "a1000000-0000-4000-8000-000000000007",
        "name": "Texto escrito",
    },
    {
        "parameters": {
            "assignments": {"assignments": [{
                "id": "d1000000-0000-4000-8000-000000000003",
                "name": "texto",
                "value": "={{ $json.texto }}",
                "type": "string",
            }]},
            "options": {},
        },
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [1180, 400],
        "id": "a1000000-0000-4000-8000-000000000008",
        "name": "Normalizar texto",
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
        "position": [1400, 400],
        "id": "a1000000-0000-4000-8000-000000000009",
        "name": "Estructurar idea",
        "credentials": CRED_OPENAI,
    },
    {
        "parameters": {"jsCode": CODE},
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1620, 400],
        "id": "a1000000-0000-4000-8000-00000000000a",
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
        "position": [1840, 400],
        "id": "a1000000-0000-4000-8000-00000000000b",
        "name": "Guardar en Airtable",
        "credentials": CRED_AT,
    },
    {
        "parameters": {
            "chatId": "={{ $('Telegram Trigger').item.json.message.chat.id }}",
            "text": "=Guardada: {{ $('Preparar fila').item.json.Idea }}\n\n{{ $('Preparar fila').item.json['One-liner'] }}\n\n{{ $('Preparar fila').item.json.Vertical }} - {{ $('Preparar fila').item.json.Tipo }} - queda en Inbox",
            "additionalFields": {"appendAttribution": False},
        },
        "type": "n8n-nodes-base.telegram",
        "typeVersion": 1.2,
        "position": [2060, 400],
        "id": "a1000000-0000-4000-8000-00000000000c",
        "name": "Confirmar",
        "credentials": CRED_TG,
    },
    {
        "parameters": {
            "content": "## Antes de activar\n\n**1.** Reemplaza `TU_CHAT_ID` en el nodo **Solo Juan** por tu chat ID numerico. Escribile a @userinfobot en Telegram y te lo dice.\n\nSin esto, cualquiera que encuentre el bot escribe en tu base de ideas.\n\n**2.** Las 3 credenciales ya estan cableadas (Telegram, OpenAI, Airtable). Si n8n marca alguna en rojo, volve a elegirla del desplegable.",
            "height": 320,
            "width": 380,
        },
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": [-180, 20],
        "id": "a1000000-0000-4000-8000-00000000000d",
        "name": "Setup",
    },
    {
        "parameters": {
            "content": "## Que NO llena este flujo\n\n**Energia**: la ponés vos en el triaje semanal.\n\n**Scores e investigacion**: los llena el agente semanal, que es la siguiente pieza.\n\nToda idea entra como **Inbox**. El campo *Captura raw* guarda el texto original para que puedas auditar que entendio mal el modelo.",
            "height": 300,
            "width": 380,
        },
        "type": "n8n-nodes-base.stickyNote",
        "typeVersion": 1,
        "position": [1600, 20],
        "id": "a1000000-0000-4000-8000-00000000000e",
        "name": "Alcance",
    },
]

connections = {
    "Telegram Trigger": {"main": [[{"node": "Solo Juan", "type": "main", "index": 0}]]},
    "Solo Juan": {"main": [[{"node": "Es audio?", "type": "main", "index": 0}], []]},
    "Es audio?": {"main": [
        [{"node": "Bajar audio", "type": "main", "index": 0}],
        [{"node": "Texto escrito", "type": "main", "index": 0}],
    ]},
    "Bajar audio": {"main": [[{"node": "Transcribir", "type": "main", "index": 0}]]},
    "Transcribir": {"main": [[{"node": "Texto desde voz", "type": "main", "index": 0}]]},
    "Texto desde voz": {"main": [[{"node": "Normalizar texto", "type": "main", "index": 0}]]},
    "Texto escrito": {"main": [[{"node": "Normalizar texto", "type": "main", "index": 0}]]},
    "Normalizar texto": {"main": [[{"node": "Estructurar idea", "type": "main", "index": 0}]]},
    "Estructurar idea": {"main": [[{"node": "Preparar fila", "type": "main", "index": 0}]]},
    "Preparar fila": {"main": [[{"node": "Guardar en Airtable", "type": "main", "index": 0}]]},
    "Guardar en Airtable": {"main": [[{"node": "Confirmar", "type": "main", "index": 0}]]},
}

workflow = {
    "name": "Captura de ideas - Telegram a Airtable",
    "nodes": nodes,
    "connections": connections,
    "pinData": {},
    "settings": {"executionOrder": "v1"},
    "active": False,
    "tags": [],
}

out = "/tmp/claude-0/-home-user-automation-ai/71aa7dac-f9df-50a9-9ad3-3329e416e25d/scratchpad/Captura_Ideas_Telegram.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)
print("escrito:", out)
