#!/usr/bin/env python3
"""Clone 4 competitor research workflows from Demo to KNR Paris.
Swaps Neon credentials, webhook paths, and injects client_id."""

import json
import os
import re
import subprocess

N8N_API_URL = os.environ.get("N8N_API_URL", "").rstrip("/")
N8N_API_KEY = os.environ.get("N8N_API_KEY", "")

OLD_CRED_ID = "d8VkJJbXARGDDqwN"  # Demo Neon
NEW_CRED_ID = "tbd1pQgg32ZbVbjD"  # KNR Paris Neon
NEW_CRED_NAME = "Neon (KNR Paris Portal)"

WORKFLOWS = {
    "meta": {
        "source_id": "ThkDsXMRbYrozpUD",
        "new_name": "KNR Paris - Meta Ad Scraper",
        "new_webhook_path": "meta-ads-scraper-knr-paris",
    },
    "tiktok": {
        "source_id": "1YjtBOliKA542GVp",
        "new_name": "KNR Paris - TikTok Organic Scraper",
        "new_webhook_path": "tiktok-organic-scraper-knr-paris",
    },
    "instagram": {
        "source_id": "1oUpxLOtYn9WqYmc",
        "new_name": "KNR Paris - Instagram Organic Scraper",
        "new_webhook_path": "instagram-organic-scraper-knr-paris",
    },
    "brief": {
        "source_id": "AAyjnr98okdCOfAl",
        "new_name": "KNR Paris - Brief Generator",
        "new_webhook_path": "brief-generator-knr-paris",
    },
}

def fetch_workflow(wf_id):
    """Fetch full workflow JSON via n8n REST API."""
    result = subprocess.run(
        ["curl", "-s", f"{N8N_API_URL}/workflows/{wf_id}",
         "-H", f"X-N8N-API-KEY: {N8N_API_KEY}"],
        capture_output=True, text=True
    )
    return json.loads(result.stdout)

def swap_credentials(nodes):
    """Replace Demo Neon credential with KNR Paris Neon."""
    for node in nodes:
        creds = node.get("credentials", {})
        if creds.get("postgres", {}).get("id") == OLD_CRED_ID:
            creds["postgres"]["id"] = NEW_CRED_ID
            creds["postgres"]["name"] = NEW_CRED_NAME

def swap_webhook_path(nodes, new_path):
    """Replace webhook path in webhook nodes."""
    for node in nodes:
        if "webhook" in node.get("type", "").lower() or node.get("type", "") == "n8n-nodes-base.webhook":
            params = node.get("parameters", {})
            if "path" in params:
                params["path"] = new_path

def remove_webhook_ids(nodes):
    """Remove webhookId from all nodes (n8n generates new ones)."""
    for node in nodes:
        if "webhookId" in node:
            del node["webhookId"]

def inject_client_id_meta(nodes):
    """For Meta scraper: add client_id to the Normalize/Format code nodes."""
    for node in nodes:
        if node.get("type") == "n8n-nodes-base.code":
            params = node.get("parameters", {})
            js_code = params.get("jsCode", "")
            # Look for the normalize/format nodes that build the return object
            if "return" in js_code and ("adArchiveId" in js_code or "ad_archive_id" in js_code):
                # Add client_id extraction at the top if not already present
                if "client_id" not in js_code:
                    client_id_extract = """
// Inject client_id from webhook
const webhookData = $('Webhook').first().json.body;
const clientId = Array.isArray(webhookData) ? (webhookData[0]?.client_id || null) : (webhookData?.client_id || null);
"""
                    params["jsCode"] = client_id_extract + js_code
                    # Add client_id to the return object
                    params["jsCode"] = params["jsCode"].replace(
                        "return [{",
                        "return [{\n    client_id: clientId,"
                    ).replace(
                        "return [{ json:",
                        "return [{ json: { client_id: clientId, ..."
                    )

def inject_client_id_organic(nodes):
    """For TikTok/Instagram: add client_id to SQL INSERT statements in Postgres nodes."""
    for node in nodes:
        if node.get("type") == "n8n-nodes-base.postgres":
            params = node.get("parameters", {})
            query = params.get("query", "")
            if "INSERT INTO" in query and "client_id" not in query:
                # Add client_id column and value
                query = re.sub(
                    r'(INSERT INTO\s+\w+\s*\(\s*\n?\s*)',
                    r'\1client_id, ',
                    query
                )
                # Add the value reference
                query = re.sub(
                    r'(VALUES\s*\(\s*\n?\s*)',
                    r"\1{{ $('Webhook').first().json.body.client_id }}, ",
                    query
                )
                params["query"] = query

def convert_brief_to_async(nodes, connections):
    """Convert Brief Generator from sync to async callback pattern."""
    # Change webhook responseMode to onReceived
    for node in nodes:
        if node.get("type") == "n8n-nodes-base.webhook":
            node["parameters"]["responseMode"] = "onReceived"

    # Remove Respond to Webhook node
    respond_nodes = [n for n in nodes if n.get("type") == "n8n-nodes-base.respondToWebhook"]
    for rn in respond_nodes:
        nodes.remove(rn)
        # Clean connections referencing this node
        if rn["name"] in connections:
            del connections[rn["name"]]
        for key in list(connections.keys()):
            for output in connections[key].get("main", []):
                connections[key]["main"] = [
                    [c for c in conns if c.get("node") != rn["name"]]
                    for conns in connections[key]["main"]
                ]

def clean_settings(wf):
    """Strip settings to only valid fields."""
    return {
        "executionOrder": wf.get("settings", {}).get("executionOrder", "v1"),
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
    }

def create_workflow(payload):
    """Create workflow via n8n REST API."""
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", f"{N8N_API_URL}/workflows",
         "-H", f"X-N8N-API-KEY: {N8N_API_KEY}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(payload)],
        capture_output=True, text=True
    )
    try:
        data = json.loads(result.stdout)
        return data.get("id"), data.get("name"), data.get("active")
    except:
        print(f"  ERROR creating workflow: {result.stdout[:200]}")
        return None, None, None

def activate_workflow(wf_id):
    """Activate workflow via n8n REST API."""
    subprocess.run(
        ["curl", "-s", "-X", "POST", f"{N8N_API_URL}/workflows/{wf_id}/activate",
         "-H", f"X-N8N-API-KEY: {N8N_API_KEY}"],
        capture_output=True, text=True
    )

def main():
    results = {}

    for key, config in WORKFLOWS.items():
        print(f"\n=== {key}: {config['new_name']} ===")
        print(f"  Fetching source: {config['source_id']}")

        wf = fetch_workflow(config["source_id"])
        nodes = wf.get("nodes", [])
        connections = wf.get("connections", {})

        print(f"  Nodes: {len(nodes)}")

        # Apply transformations
        swap_credentials(nodes)
        swap_webhook_path(nodes, config["new_webhook_path"])
        remove_webhook_ids(nodes)

        if key == "meta":
            inject_client_id_meta(nodes)
        elif key in ("tiktok", "instagram"):
            inject_client_id_organic(nodes)
        elif key == "brief":
            convert_brief_to_async(nodes, connections)
            # Brief Generator doesn't use Postgres — skip credential swap

        payload = {
            "name": config["new_name"],
            "nodes": nodes,
            "connections": connections,
            "settings": clean_settings(wf),
        }

        # Save to file for inspection
        filepath = f"/tmp/knr_{key}_workflow.json"
        with open(filepath, "w") as f:
            json.dump(payload, f)
        print(f"  Saved to {filepath}")

        # Create
        wf_id, wf_name, wf_active = create_workflow(payload)
        if wf_id:
            print(f"  Created: {wf_id} | {wf_name}")
            activate_workflow(wf_id)
            print(f"  Activated")
            results[key] = wf_id
        else:
            print(f"  FAILED")

    print(f"\n=== RESULTS ===")
    for key, wf_id in results.items():
        print(f"  {key}: {wf_id}")

if __name__ == "__main__":
    main()
