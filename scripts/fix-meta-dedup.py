#!/usr/bin/env python3
"""Fix Deduplicate node: add client_id passthrough."""
import json

with open("/tmp/knr_meta_workflow_fixed.json") as f:
    wf = json.load(f)

for n in wf["nodes"]:
    if n["name"] == "Deduplicate":
        code = n["parameters"]["jsCode"]
        code = code.replace(
            "ad_archive_id: kept.ad_archive_id,",
            "client_id: kept.client_id,\n      ad_archive_id: kept.ad_archive_id,"
        )
        n["parameters"]["jsCode"] = code
        print("Fixed Deduplicate: added client_id: kept.client_id")

with open("/tmp/knr_meta_workflow_fixed.json", "w") as f:
    json.dump(wf, f)
print("Saved")
