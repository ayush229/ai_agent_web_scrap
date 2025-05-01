from flask import Flask, request, jsonify, make_response, send_from_directory
from functools import wraps
from scraper import scrape_website, crawl_website
import logging
import os
import json
from together import Together
from urllib.parse import urlparse, urljoin
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Authentication credentials
AUTH_USERNAME = "ayush1"
AUTH_PASSWORD = "blackbox098"

# Directory to store scraped content
SCRAPED_DATA_DIR = "scraped_content"
AGENTS_FILE = "agents.json"
os.makedirs(SCRAPED_DATA_DIR, exist_ok=True)

# Initialize Together API client
client = Together()

def check_auth(username, password):
    return username == AUTH_USERNAME and password == AUTH_PASSWORD

def authenticate():
    return make_response(
        jsonify({"error": "Authentication required"}),
        401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
    )

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

def load_agents():
    try:
        with open(AGENTS_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_agents(agents):
    with open(AGENTS_FILE, 'w') as f:
        json.dump(agents, f, indent=2)

# ... [keep all your existing functions like ask_llama, extract_text_from_section, etc.] ...

@app.route('/api/agents', methods=['GET'])
@requires_auth
def get_agents():
    agents = load_agents()
    return jsonify(agents)

@app.route('/api/agents/<agent_id>', methods=['GET', 'PUT', 'DELETE'])
@requires_auth
def manage_agent(agent_id):
    agents = load_agents()
    agent = next((a for a in agents if a['id'] == agent_id), None)
    
    if request.method == 'GET':
        if not agent:
            return jsonify({"error": "Agent not found"}), 404
        return jsonify(agent)
    
    elif request.method == 'PUT':
        if not agent:
            return jsonify({"error": "Agent not found"}), 404
        
        data = request.get_json()
        urls = data.get('urls', agent['urls'])
        name = data.get('name', agent['name'])
        
        # Re-scrape and update content
        combined_text = ""
        for url in urls:
            result = scrape_website(url, 'beautify')
            if result["status"] == "error":
                return jsonify({"status": "error", "error": f"Error scraping {url}: {result['error']}"}), 500

            try:
                if "sections" in result["data"]:
                    sections = result["data"]["sections"]
                    for sec in sections:
                        if sec.get("heading") and sec["heading"].get("text"):
                            combined_text += f"\n\n{sec['heading']['text']}"
                        for para in sec.get("content", []):
                            combined_text += f"\n{para}"
            except Exception as e:
                print(f"Content parsing failed for storage for url {url}: {e}")
                combined_text += result.get("data", "")

        filepath = os.path.join(SCRAPED_DATA_DIR, f"{agent_id}.txt")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(combined_text)

        # Update agent
        agent['urls'] = urls
        agent['name'] = name
        save_agents(agents)
        return jsonify(agent)
    
    elif request.method == 'DELETE':
        if not agent:
            return jsonify({"error": "Agent not found"}), 404
        
        # Remove from agents list
        agents = [a for a in agents if a['id'] != agent_id]
        save_agents(agents)
        
        # Delete scraped content file
        filepath = os.path.join(SCRAPED_DATA_DIR, f"{agent_id}.txt")
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({"status": "success"})

# ... [keep all your existing routes like /scrape_and_store, /ask_stored, etc.] ...

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join('frontend/build', path)):
        return send_from_directory('frontend/build', path)
    else:
        return send_from_directory('frontend/build', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)