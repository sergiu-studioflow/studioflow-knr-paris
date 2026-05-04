#!/usr/bin/env python3
"""Fix Brief Generator: add Build Callback Payload + Callback HTTP node."""
import json

with open("/tmp/knr_brief_workflow.json") as f:
    wf = json.load(f)

nodes = wf["nodes"]
connections = wf["connections"]

# Find Parse & Validate node position for placing new nodes after it
parse_node = next(n for n in nodes if n["name"] == "Parse & Validate")
parse_pos = parse_node["position"]

# Add Build Callback Payload code node
callback_code = {
    "parameters": {
        "jsCode": """const webhookData = $('Webhook').first().json.body;
const parseData = $input.first().json;

return [{
  json: {
    briefId: webhookData.briefId,
    success: parseData.success === true,
    brief: parseData.brief || null,
    model: parseData.model || null,
    durationMs: parseData.durationMs || null,
    error: parseData.error || null,
  }
}];"""
    },
    "id": "callback-payload-001",
    "name": "Build Callback Payload",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [parse_pos[0] + 240, parse_pos[1]],
}
nodes.append(callback_code)

# Add Callback to Portal HTTP Request node
callback_http = {
    "parameters": {
        "method": "POST",
        "url": "https://studioflow-knr-paris.vercel.app/api/research-briefs/callback",
        "sendBody": True,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {
            "timeout": 30000,
        }
    },
    "id": "callback-http-001",
    "name": "Callback to Portal",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [parse_pos[0] + 480, parse_pos[1]],
    "onError": "continueRegularOutput",
}
nodes.append(callback_http)

# Update connections: Parse & Validate -> Build Callback Payload -> Callback to Portal
# First, remove existing connections FROM Parse & Validate
if "Parse & Validate" in connections:
    del connections["Parse & Validate"]

connections["Parse & Validate"] = {
    "main": [[{"node": "Build Callback Payload", "type": "main", "index": 0}]]
}
connections["Build Callback Payload"] = {
    "main": [[{"node": "Callback to Portal", "type": "main", "index": 0}]]
}

# Save
with open("/tmp/knr_brief_workflow_fixed.json", "w") as f:
    json.dump(wf, f)

print("Fixed Brief Generator:")
print("  + Build Callback Payload code node")
print("  + Callback to Portal HTTP node -> https://studioflow-knr-paris.vercel.app/api/research-briefs/callback")
print("  - Connections: Parse & Validate -> Build Callback -> Callback to Portal")
print("Saved to /tmp/knr_brief_workflow_fixed.json")
