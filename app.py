from flask import Flask, request, jsonify
import json
from difflib import get_close_matches

app = Flask(__name__)

# Load 10k+ dataset
with open("dataset/plant_faq.json", "r", encoding="utf-8") as f:
    data = json.load(f)

prompts = [item["prompt"] for item in data]

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("prompt", "")
    match = get_close_matches(user_input, prompts, n=1, cutoff=0.5)
    if match:
        answer = next(item["response"] for item in data if item["prompt"] == match[0])
    else:
        answer = "Sorry, I don't know that yet."
    return jsonify({"response": answer})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
