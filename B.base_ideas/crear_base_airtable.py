#!/usr/bin/env python3
"""
Crea la base "Ideas de Negocio" en Airtable a partir de airtable_ideas_schema.json.

Uso:
    export AIRTABLE_PAT="patXXXXXXXX..."          # scopes: schema.bases:write, data.records:write
    export AIRTABLE_WORKSPACE_ID="wspXXXXXXXX"    # esta en la URL de tu workspace en airtable.com
    python3 crear_base_airtable.py

Si la base ya existe y solo queres agregarle las tablas:
    export AIRTABLE_BASE_ID="appXXXXXXXX"
    python3 crear_base_airtable.py

El PAT se lee de una variable de entorno a proposito: no lo pegues en el archivo
ni lo pases por chat.

Limitaciones conocidas de la API de Airtable (no son bugs de este script):
  - No se pueden crear campos de tipo formula. "Score total" queda como numero,
    escrito por el agente. Si despues queres una formula, se agrega a mano en la UI.
  - No se pueden crear vistas por API. Las vistas del schema quedan documentadas
    al final de la corrida para armarlas a mano (5 minutos) o por el agente.
  - Los campos de tipo link se crean en una segunda pasada, porque necesitan el
    ID de la tabla destino, que recien existe despues de crear las tablas.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://api.airtable.com/v0/meta"
DATA_API = "https://api.airtable.com/v0"
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "airtable_ideas_schema.json")

# Tipos que la API de Airtable no acepta al crear la base de una, pero si
# despues via el endpoint de campos.
DEFERRED_TYPES = {"createdTime", "lastModifiedTime"}


def call(url, payload=None, method="GET", retries=4):
    """Llama a la API con backoff exponencial ante rate limit o error de red."""
    token = os.environ.get("AIRTABLE_PAT")
    if not token:
        sys.exit("Falta AIRTABLE_PAT. Exportala antes de correr el script.")

    body = json.dumps(payload).encode() if payload is not None else None
    delay = 2
    for intento in range(retries + 1):
        req = urllib.request.Request(url, data=body, method=method)
        req.add_header("Authorization", f"Bearer {token}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            detalle = e.read().decode(errors="replace")
            # 429 = rate limit, 5xx = problema del lado de Airtable. Vale reintentar.
            if e.code in (429, 500, 502, 503) and intento < retries:
                time.sleep(delay)
                delay *= 2
                continue
            sys.exit(f"HTTP {e.code} en {method} {url}\n{detalle}")
        except urllib.error.URLError as e:
            if intento < retries:
                time.sleep(delay)
                delay *= 2
                continue
            sys.exit(f"Error de red en {method} {url}: {e}")


def limpiar(field):
    """Deja el campo con las claves que acepta la API, sin la descripcion interna."""
    out = {"name": field["name"], "type": field["type"]}
    if "options" in field:
        out["options"] = field["options"]
    if "description" in field:
        out["description"] = field["description"][:20000]
    return out


def main():
    with open(SCHEMA_FILE, encoding="utf-8") as f:
        schema = json.load(f)

    base_id = os.environ.get("AIRTABLE_BASE_ID")
    workspace_id = os.environ.get("AIRTABLE_WORKSPACE_ID")

    # Los campos createdTime / lastModifiedTime se agregan despues de crear la tabla.
    diferidos = {}
    tablas_payload = []
    for t in schema["tables"]:
        ahora, luego = [], []
        for f in t["fields"]:
            (luego if f["type"] in DEFERRED_TYPES else ahora).append(limpiar(f))
        diferidos[t["name"]] = luego
        tablas_payload.append({
            "name": t["name"],
            "description": t.get("description", "")[:20000],
            "fields": ahora,
        })

    if base_id:
        print(f"Usando base existente {base_id}. Creando tablas...")
        existentes = {t["name"] for t in call(f"{API}/bases/{base_id}/tables")["tables"]}
        for t in tablas_payload:
            if t["name"] in existentes:
                print(f"  = {t['name']} ya existe, la salteo")
                continue
            call(f"{API}/bases/{base_id}/tables", t, "POST")
            print(f"  + tabla {t['name']}")
    else:
        if not workspace_id:
            sys.exit("Falta AIRTABLE_WORKSPACE_ID (o AIRTABLE_BASE_ID si la base ya existe).")
        print(f"Creando base '{schema['base']['name']}' en {workspace_id}...")
        creada = call(f"{API}/bases", {
            "name": schema["base"]["name"],
            "workspaceId": workspace_id,
            "tables": tablas_payload,
        }, "POST")
        base_id = creada["id"]
        print(f"  + base creada: {base_id}")

    # Mapa nombre -> id, necesario para los campos diferidos y los links.
    tablas = {t["name"]: t["id"] for t in call(f"{API}/bases/{base_id}/tables")["tables"]}

    print("Agregando campos de fecha automatica...")
    for nombre_tabla, campos in diferidos.items():
        for campo in campos:
            call(f"{API}/bases/{base_id}/tables/{tablas[nombre_tabla]}/fields", campo, "POST")
            print(f"  + {nombre_tabla}.{campo['name']}")

    print("Agregando campos de link...")
    for link in schema["link_fields_post_creation"]:
        call(f"{API}/bases/{base_id}/tables/{tablas[link['table']]}/fields", {
            "name": link["name"],
            "type": "multipleRecordLinks",
            "description": link.get("description", "")[:20000],
            "options": {"linkedTableId": tablas[link["linked_table"]]},
        }, "POST")
        print(f"  + {link['table']}.{link['name']} -> {link['linked_table']}")

    print("Cargando criterios de scoring...")
    call(f"{DATA_API}/{base_id}/{tablas['Criterios']}", {
        "records": [{"fields": c} for c in schema["seed_criterios"]],
        "typecast": True,
    }, "POST")
    print(f"  + {len(schema['seed_criterios'])} criterios")

    print(f"\nListo: https://airtable.com/{base_id}")
    print("\nFalta armar a mano las vistas (la API no las crea):")
    for v in schema["views"]:
        filtro = v.get("filter", "sin filtro")
        print(f"  - [{v['table']}] {v['name']} ({v['type']}): {filtro}")


if __name__ == "__main__":
    main()
