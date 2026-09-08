# Shreya Computing — Virtual Desktop Resource Optimizer

An interactive 0/1 Knapsack Dynamic Programming project built with Python + Flask.

## Real-life scenario

Imagine a centralized computing / virtual desktop server with limited resources. Different workloads compete for those resources.

- **Weight = Resource Cost** (CPU/RAM/storage units required)
- **Value = Business Value** (importance/benefit of running the workload)
- **Capacity = Available Server Resources**
- **Goal = Maximize total business value without exceeding capacity**

This is a practical demonstration of 0/1 Knapsack for an NComputing-style centralized computing environment. It does **not** claim that NComputing internally uses this exact algorithm.

## Features

- Interactive browser dashboard
- Edit workload names, resource costs, and business values
- Change server capacity
- Add/remove workloads
- Python backend performs the actual 0/1 Knapsack algorithm
- Dynamic Programming table
- Backtracking to identify selected workloads
- Animated DP-table calculation
- Optimization statistics

## Run on Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000`.

If PowerShell blocks virtual-environment activation:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
```

## Where is the algorithm?

The main algorithm is in `app.py`, inside `solve_knapsack(workloads, capacity)`.

The key recurrence is:

```python
dp[i][c] = dp[i - 1][c]

if weight <= c:
    include_value = value + dp[i - 1][c - weight]
    dp[i][c] = max(dp[i][c], include_value)
```

After filling the table, the code backtracks from `dp[n][capacity]` to determine which workloads were selected.

## Project structure

```text
Shreya-Computing/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```
