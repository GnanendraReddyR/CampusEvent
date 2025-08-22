from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes (for local dev with React)
CORS(app)

# In-memory "database"
events = [
    {"id": 1, "title": "Hackathon", "date": "2025-09-01"},
    {"id": 2, "title": "Cultural Fest", "date": "2025-09-15"}
]

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/events")
def get_events():
    # Returns a plain array so the React app can consume it directly
    return jsonify(events), 200

@app.post("/addevent")
def add_event():
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    title = (data.get("title") or "").strip()
    date = (data.get("date") or "").strip()

    if not title or not date:
        return jsonify({"status": "error", "message": "title and date are required"}), 400

    # naive YYYY-MM-DD check
    import re
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400

    new_id = (max((e["id"] for e in events), default=0) + 1) if events else 1
    new_event = {"id": new_id, "title": title, "date": date}
    events.append(new_event)
    return jsonify({"status": "success", "event": new_event}), 201

if __name__ == "__main__":
    # Use Flask's built-in server for development
    app.run(host="0.0.0.0", port=5000, debug=True)
