from flask import Flask, jsonify, request, send_from_directory
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

# Example API endpoint
@app.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello from the Python backend!"})

# Example endpoint to get stored file (adapt your logic)
@app.route('/get_stored_file/<agent_id>', methods=['GET'])
def get_stored_file(agent_id):
    # Replace this with your actual logic to retrieve the stored file
    dummy_content = f"Content for agent ID: {agent_id}\nThis is some scraped data."
    return dummy_content

# Example endpoint to scrape and store (adapt your logic)
@app.route('/scrape_and_store', methods=['POST'])
def scrape_and_store():
    data = request.get_json()
    urls = data.get('urls')
    agent_name = data.get('agent_name')
    # Replace this with your actual scraping and storing logic
    unique_code = f"agent_{agent_name.replace(' ', '_')}_{os.urandom(8).hex()}"
    return jsonify({"message": f"Scraping initiated for {agent_name}", "unique_code": unique_code})

# Example endpoint to ask stored data (adapt your logic)
@app.route('/ask_stored', methods=['POST'])
def ask_stored():
    data = request.get_json()
    unique_code = data.get('unique_code')
    query = data.get('query')
    # Replace this with your actual AI query logic
    reply = f"AI response to '{query}' for agent {unique_code}."
    return jsonify({"reply": reply})

# Example endpoint to manage agents (adapt your logic)
@app.route('/api/agents', methods=['GET', 'POST'])
def manage_agents():
    if request.method == 'GET':
        # Replace with your logic to fetch agents
        agents = [{"id": 1, "name": "Agent 1", "urls": ["url1", "url2"], "created_at": "2025-05-01"}, {"id": 2, "name": "Agent 2", "urls": ["url3"], "created_at": "2025-05-01"}]
        return jsonify(agents)
    elif request.method == 'POST':
        data = request.get_json()
        # Replace with your logic to create a new agent
        new_agent = {"id": 3, "name": data.get('name'), "urls": data.get('urls'), "created_at": "2025-05-01"}
        return jsonify({"message": "Agent created successfully", "agent": new_agent}), 201

@app.route('/api/agents/<int:agent_id>', methods=['PUT', 'DELETE'])
def manage_specific_agent(agent_id):
    if request.method == 'PUT':
        data = request.get_json()
        # Replace with your logic to update agent
        return jsonify({"message": f"Agent {agent_id} updated successfully"})
    elif request.method == 'DELETE':
        # Replace with your logic to delete agent
        return jsonify({"message": f"Agent {agent_id} deleted successfully"})

# Serve frontend static files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True, port=os.environ.get('PORT', 5000))
