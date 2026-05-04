#!/usr/bin/env python3
"""Deep comparison: KNR Paris vs Web Profits workflows."""
import json

def load(path):
    with open(path) as f:
        return json.load(f)

def compare_meta():
    print("=" * 70)
    print("META AD SCRAPER COMPARISON")
    print("=" * 70)

    wp = load("/tmp/wp_meta.json")
    knr = load("/tmp/knr_meta_workflow_fixed.json")

    wp_nodes = {n["name"]: n for n in wp["nodes"]}
    knr_nodes = {n["name"]: n for n in knr["nodes"]}

    # 1. Node count
    print(f"\nNode count: WP={len(wp_nodes)} KNR={len(knr_nodes)}")

    # 2. Check nodes that exist in WP but not KNR and vice versa
    wp_only = set(wp_nodes.keys()) - set(knr_nodes.keys())
    knr_only = set(knr_nodes.keys()) - set(wp_nodes.keys())
    if wp_only:
        print(f"\nNodes ONLY in Web Profits: {wp_only}")
    if knr_only:
        print(f"Nodes ONLY in KNR: {knr_only}")

    # 3. Compare Normalize node — client_id handling
    print("\n--- Normalize node: client_id ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        if "Normalize" in nodes:
            code = nodes["Normalize"].get("parameters", {}).get("jsCode", "")
            has_extract = "client_id" in code and "webhook" in code.lower()
            has_return = "client_id: clientId" in code or "client_id: client" in code
            print(f"  {label}: extract_from_webhook={has_extract}, in_return={has_return}")

    # 4. Compare Deduplicate node
    print("\n--- Deduplicate node: client_id ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        if "Deduplicate" in nodes:
            code = nodes["Deduplicate"].get("parameters", {}).get("jsCode", "")
            has_passthrough = "client_id" in code
            print(f"  {label}: client_id_passthrough={has_passthrough}")

    # 5. Compare Save to Neon schema
    print("\n--- Save to Neon: schema columns ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        if "Save to Neon" in nodes:
            schema = nodes["Save to Neon"].get("parameters", {}).get("columns", {}).get("schema", [])
            cols = [s["id"] for s in schema]
            has_client_id = "client_id" in cols
            print(f"  {label}: client_id_in_schema={has_client_id}, total_cols={len(cols)}")
            if not has_client_id:
                print(f"    MISSING! Columns: {cols[:10]}...")

    # 6. Compare webhook paths
    print("\n--- Webhook ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        for n in nodes.values():
            if n.get("type") == "n8n-nodes-base.webhook":
                print(f"  {label}: path={n['parameters'].get('path')}")

def compare_brief():
    print("\n" + "=" * 70)
    print("BRIEF GENERATOR COMPARISON")
    print("=" * 70)

    wp = load("/tmp/wp_brief.json")

    # Load the LIVE KNR brief (re-fetch from n8n)
    import subprocess, os
    result = subprocess.run(
        ["curl", "-s", f"{os.environ.get('N8N_API_URL', '')}/workflows/yeuACTc8XLJQxTAp",
         "-H", f"X-N8N-API-KEY: {os.environ.get('N8N_API_KEY', '')}"],
        capture_output=True, text=True
    )
    knr = json.loads(result.stdout)

    wp_nodes = {n["name"]: n for n in wp["nodes"]}
    knr_nodes = {n["name"]: n for n in knr["nodes"]}

    print(f"\nNode count: WP={len(wp_nodes)} KNR={len(knr_nodes)}")
    print(f"\nWP nodes: {list(wp_nodes.keys())}")
    print(f"KNR nodes: {list(knr_nodes.keys())}")

    # Check webhook responseMode
    print("\n--- Webhook ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        for n in nodes.values():
            if n.get("type") == "n8n-nodes-base.webhook":
                rm = n["parameters"].get("responseMode", "NOT SET")
                path = n["parameters"].get("path", "")
                print(f"  {label}: path={path}, responseMode={rm}")

    # Check for Respond to Webhook (should NOT exist)
    print("\n--- Respond to Webhook ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        respond = [n for n in nodes.keys() if "respond" in n.lower()]
        print(f"  {label}: {respond if respond else 'NONE (correct)'}")

    # Check callback nodes
    print("\n--- Callback chain ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        has_build = any("callback" in n.lower() and "build" in n.lower() for n in nodes.keys())
        has_http = any("callback" in n.lower() and ("http" in n.lower() or "portal" in n.lower()) for n in nodes.keys())
        print(f"  {label}: Build Callback={has_build}, HTTP Callback={has_http}")
        # Show callback URL if exists
        for n in nodes.values():
            if "callback" in n["name"].lower() and n.get("type") == "n8n-nodes-base.httpRequest":
                url = n.get("parameters", {}).get("url", "")
                print(f"    URL: {url}")

    # Check connections
    print("\n--- Connection chain ---")
    for label, wf_data in [("WP", wp), ("KNR", knr)]:
        conns = wf_data.get("connections", {})
        if "Parse & Validate" in conns:
            targets = [c["node"] for c in conns["Parse & Validate"].get("main", [[]])[0]]
            print(f"  {label}: Parse & Validate -> {targets}")
        if "Build Callback Payload" in conns:
            targets = [c["node"] for c in conns["Build Callback Payload"].get("main", [[]])[0]]
            print(f"  {label}: Build Callback Payload -> {targets}")

def compare_instagram():
    print("\n" + "=" * 70)
    print("INSTAGRAM SCRAPER COMPARISON")
    print("=" * 70)

    wp = load("/tmp/wp_instagram.json")

    import subprocess, os
    result = subprocess.run(
        ["curl", "-s", f"{os.environ.get('N8N_API_URL', '')}/workflows/iJwkE2HHaaxo7SjV",
         "-H", f"X-N8N-API-KEY: {os.environ.get('N8N_API_KEY', '')}"],
        capture_output=True, text=True
    )
    knr = json.loads(result.stdout)

    wp_nodes = {n["name"]: n for n in wp["nodes"]}
    knr_nodes = {n["name"]: n for n in knr["nodes"]}

    print(f"\nNode count: WP={len(wp_nodes)} KNR={len(knr_nodes)}")

    # Compare Postgres INSERT queries for client_id
    print("\n--- Postgres INSERT nodes: client_id check ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        for name, n in nodes.items():
            if n.get("type") == "n8n-nodes-base.postgres":
                q = n.get("parameters", {}).get("query", "")
                if "INSERT" in q:
                    has_col = "client_id" in q.split("VALUES")[0] if "VALUES" in q else False
                    has_val = "client_id" in q
                    ref_pattern = "$('Webhook')" in q or "first().json" in q
                    print(f"  {label} | {name}: col={has_col}, ref_pattern={'webhook_ref' if ref_pattern else 'OTHER'}")

    # Compare webhook
    print("\n--- Webhook ---")
    for label, nodes in [("WP", wp_nodes), ("KNR", knr_nodes)]:
        for n in nodes.values():
            if n.get("type") == "n8n-nodes-base.webhook":
                print(f"  {label}: path={n['parameters'].get('path')}")

if __name__ == "__main__":
    compare_meta()
    compare_brief()
    compare_instagram()
