from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load graph data from a JSON file
with open("data/graph_data.json") as f:
    graph_data = json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/graph-data")
def graph_data_api():
    return jsonify(graph_data)

if __name__ == "__main__":
    app.run(debug=True)