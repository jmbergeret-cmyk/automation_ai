#!/usr/bin/env python3
"""
Crea la tabla "Videos y cursos" dentro de la base de ideas ya existente.

Uso:
    export AIRTABLE_PAT="patXXXX..."   # scopes: schema.bases:write
    python3 crear_tabla_videos.py

Reutiliza el mismo helper de red que crear_base_airtable.py: backoff exponencial
ante rate limit, y nunca imprime el token.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://api.airtable.com/v0/meta"
BASE_ID = "appieVX1O0rtYjQnp"
SCHEMA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tabla_videos_schema.json")


def call(url, payload=None, method="GET", retries=4):
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
            with urllib.request.urlopen(req) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            detalle = e.read().decode(errors="replace")
            if e.code in (429, 500, 502, 503) and intento < retries:
                time.sleep(delay); delay *= 2; continue
            sys.exit(f"HTTP {e.code} en {method} {url}\n{detalle}")
        except urllib.error.URLError as e:
            if intento < retries:
                time.sleep(delay); delay *= 2; continue
            sys.exit(f"Error de red: {e}")


def limpiar(f):
    out = {"name": f["name"], "type": f["type"]}
    if "options" in f:
        out["options"] = f["options"]
    if "description" in f:
        out["description"] = f["description"][:20000]
    return out


def main():
    with open(SCHEMA, encoding="utf-8") as fh:
        esquema = json.load(fh)

    tablas = {t["name"]: t["id"] for t in call(f"{API}/bases/{BASE_ID}/tables")["tables"]}
    nombre = esquema["table"]["name"]

    if nombre in tablas:
        print(f"La tabla '{nombre}' ya existe ({tablas[nombre]}). No la toco.")
        tabla_id = tablas[nombre]
    else:
        creada = call(f"{API}/bases/{BASE_ID}/tables", {
            "name": nombre,
            "description": esquema["table"]["description"][:20000],
            "fields": [limpiar(f) for f in esquema["fields"]],
        }, "POST")
        tabla_id = creada["id"]
        print(f"+ tabla '{nombre}' creada: {tabla_id}")

    # Los campos de formula y de link se agregan despues: el de link necesita el
    # ID de la tabla destino, que solo se conoce una vez creadas ambas.
    existentes = {f["name"] for f in call(f"{API}/bases/{BASE_ID}/tables")["tables"]
                  if f["id"] == tabla_id for f in f["fields"]}

    for campo in esquema["campos_post_creacion"]:
        if campo["name"] in existentes:
            print(f"  = {campo['name']} ya existe")
            continue
        if campo["type"] == "formula":
            payload = {"name": campo["name"], "type": "formula",
                       "options": {"formula": campo["formula"]}}
        else:
            destino = tablas.get(campo["linked_table"])
            if not destino:
                print(f"  ! no encontre la tabla '{campo['linked_table']}', salteo {campo['name']}")
                continue
            payload = {"name": campo["name"], "type": "multipleRecordLinks",
                       "options": {"linkedTableId": destino}}
        payload["description"] = campo.get("description", "")[:20000]
        call(f"{API}/bases/{BASE_ID}/tables/{tabla_id}/fields", payload, "POST")
        print(f"  + {campo['name']}")

    print(f"\nListo: https://airtable.com/{BASE_ID}/{tabla_id}")
    print("\nFalta armar a mano las vistas (la API no las crea):")
    for v in esquema["vistas"]:
        print(f"  - {v['name']}: {v['filtro']}")


if __name__ == "__main__":
    main()
