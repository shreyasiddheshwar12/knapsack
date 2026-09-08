from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

DEFAULT_WORKLOADS = [
    {"name": "Developer IDE", "weight": 8, "value": 95},
    {"name": "Database Processing", "weight": 6, "value": 90},
    {"name": "Video Processing", "weight": 7, "value": 85},
    {"name": "Office Productivity", "weight": 3, "value": 50},
    {"name": "Web Browsing", "weight": 2, "value": 35},
    {"name": "Training Software", "weight": 5, "value": 75},
]

def solve_knapsack(workloads, capacity):
    n = len(workloads)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # 0/1 Knapsack Dynamic Programming
    for i in range(1, n + 1):
        weight = workloads[i - 1]["weight"]
        value = workloads[i - 1]["value"]
        for c in range(capacity + 1):
            dp[i][c] = dp[i - 1][c]
            if weight <= c:
                include_value = value + dp[i - 1][c - weight]
                dp[i][c] = max(dp[i][c], include_value)

    selected_indices = []
    c = capacity
    for i in range(n, 0, -1):
        if dp[i][c] != dp[i - 1][c]:
            selected_indices.append(i - 1)
            c -= workloads[i - 1]["weight"]
    selected_indices.reverse()

    selected = []
    for i in selected_indices:
        item = dict(workloads[i])
        item["index"] = i
        selected.append(item)

    used = sum(workloads[i]["weight"] for i in selected_indices)
    return {
        "max_value": dp[n][capacity],
        "selected": selected,
        "selected_indices": selected_indices,
        "used": used,
        "remaining": capacity - used,
        "dp": dp,
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/demo")
def demo():
    return jsonify({"capacity": 15, "workloads": DEFAULT_WORKLOADS})

@app.route("/api/optimize", methods=["POST"])
def optimize():
    data = request.get_json(force=True)
    try:
        capacity = int(data.get("capacity", 0))
        workloads = data.get("workloads", [])
        if capacity < 0:
            raise ValueError("Capacity cannot be negative.")
        if not isinstance(workloads, list):
            raise ValueError("Workloads must be a list.")

        clean = []
        for item in workloads:
            name = str(item.get("name", "Unnamed workload")).strip() or "Unnamed workload"
            weight = int(item.get("weight", 0))
            value = int(item.get("value", 0))
            if weight < 0 or value < 0:
                raise ValueError("Weight and value must be non-negative.")
            clean.append({"name": name, "weight": weight, "value": value})

        return jsonify(solve_knapsack(clean, capacity))
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400

if __name__ == "__main__":
    app.run(debug=True)
