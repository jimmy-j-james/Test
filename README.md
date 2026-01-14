# Real Estate Model Builder

This project is a simple web app for building and exporting a real estate financial model.

## Extremely basic setup (step-by-step)

### 0) Prerequisites (one-time)

You need **Python 3.9+** installed.

- **Mac:** Open Terminal and run `python3 --version`.
- **Windows:** Open PowerShell and run `python --version`.
- **Linux:** Open a terminal and run `python3 --version`.

If the command says “not found”, install Python from https://www.python.org/downloads/.

### 1) Download or open the project folder

If you already have the project:
1. Open the folder named `Test` (or wherever you saved it).
2. Make sure you can see files like `README.md`, `server.py`, and `requirements.txt`.

### 2) Open a terminal in the project folder

- **Mac:** Open Terminal, then run:
  ```bash
  cd /path/to/your/Test
  ```
- **Windows (PowerShell):**
  ```powershell
  cd C:\path\to\your\Test
  ```
- **Linux:**
  ```bash
  cd /path/to/your/Test
  ```

### 3) Create a virtual environment (recommended)

This keeps the project’s Python packages isolated.

- **Mac/Linux:**
  ```bash
  python3 -m venv .venv
  ```
- **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  ```

### 4) Activate the virtual environment

- **Mac/Linux:**
  ```bash
  source .venv/bin/activate
  ```
- **Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```

If you see a policy error on Windows, run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Then try the activate command again.

### 5) Install the Python dependencies

- **Mac/Linux:**
  ```bash
  pip install -r requirements.txt
  ```
- **Windows (PowerShell):**
  ```powershell
  pip install -r requirements.txt
  ```

### 6) Start the server

- **Mac/Linux:**
  ```bash
  python server.py
  ```
- **Windows (PowerShell):**
  ```powershell
  python server.py
  ```

You should see output like:
```
Running on http://127.0.0.1:8000
```

### 7) Open the app in your browser

Go to: **http://localhost:8000**

### 8) (Optional) Stop the server

Back in the terminal, press **Ctrl + C**.

---

## What it does

- Collects real estate assumptions in a single form.
- Runs a Python financial model API.
- Displays key KPIs and full JSON output.
- Exports the model output as a JSON file.
