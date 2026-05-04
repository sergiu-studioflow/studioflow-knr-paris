#!/usr/bin/env python3
"""Fix Meta Ad Scraper: add client_id to Normalize return + Save to Neon schema."""

import json

with open("/tmp/knr_meta_workflow.json") as f:
    wf = json.load(f)

# FIX 1: Add client_id to the Normalize node's return object
for n in wf["nodes"]:
    if n["name"] == "Normalize":
        code = n["parameters"]["jsCode"]
        code = code.replace(
            "ad_archive_id: ad.ad_archive_id",
            "client_id: clientId,\n      ad_archive_id: ad.ad_archive_id"
        )
        n["parameters"]["jsCode"] = code
        print("Fixed Normalize node: added client_id to return object")

# FIX 2: Add client_id to Deduplicate passthrough
for n in wf["nodes"]:
    if n["name"] == "Deduplicate":
        code = n["parameters"]["jsCode"]
        if "client_id" in code and "client_id: best.client_id" not in code:
            if "ad_archive_id: best.ad_archive_id" in code:
                code = code.replace(
                    "ad_archive_id: best.ad_archive_id",
                    "client_id: best.client_id,\n      ad_archive_id: best.ad_archive_id"
                )
                n["parameters"]["jsCode"] = code
                print("Fixed Deduplicate node: added client_id passthrough")

# FIX 3: Add client_id to Save to Neon schema
for n in wf["nodes"]:
    if n["name"] == "Save to Neon":
        schema = n["parameters"]["columns"]["schema"]
        existing_ids = [s["id"] for s in schema]
        if "client_id" not in existing_ids:
            client_id_col = {
                "id": "client_id",
                "displayName": "client_id",
                "required": False,
                "defaultMatch": False,
                "display": True,
                "type": "string",
                "canBeUsedToMatch": True,
                "removed": False
            }
            id_idx = next((i for i, s in enumerate(schema) if s["id"] == "id"), 0)
            schema.insert(id_idx + 1, client_id_col)
            print("Fixed Save to Neon: added client_id to schema")

with open("/tmp/knr_meta_workflow_fixed.json", "w") as f:
    json.dump(wf, f)
print("Saved to /tmp/knr_meta_workflow_fixed.json")
