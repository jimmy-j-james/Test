from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict, Tuple

from flask import Flask, jsonify, request, send_from_directory

from financial_model import ModelAssumptions, build_model

app = Flask(__name__, static_folder=".", static_url_path="")


@app.get("/")
def index() -> Any:
    return send_from_directory(".", "index.html")


@app.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok"})


def _coerce(value: Any, cast_type: type) -> Tuple[bool, Any]:
    if value is None or value == "":
        return True, None
    try:
        return True, cast_type(value)
    except (TypeError, ValueError):
        return False, None


@app.post("/api/model")
def run_model() -> Any:
    payload = request.get_json(silent=True) or {}
    base = asdict(ModelAssumptions())

    int_fields = {
        "hold_years",
        "debt_amort_years",
        "debt_term_years",
        "debt_interest_only_years",
    }
    float_fields = {
        "purchase_price",
        "rent",
        "other_income",
        "rent_growth",
        "vacancy_rate",
        "operating_expenses",
        "expense_growth",
        "capex_percent_revenue",
        "working_capital_percent_revenue",
        "debt_ltv",
        "debt_interest_rate",
        "exit_cap_rate",
        "sales_cost_percent",
        "discount_rate",
    }

    errors = []
    updates: Dict[str, Any] = {}

    for key, value in payload.items():
        if key in int_fields:
            ok, parsed = _coerce(value, int)
        elif key in float_fields:
            ok, parsed = _coerce(value, float)
        elif key == "balance_sheet_valuation":
            ok, parsed = True, str(value)
        else:
            continue

        if not ok:
            errors.append(f"Invalid value for {key}.")
            continue

        if parsed is not None:
            updates[key] = parsed

    if errors:
        return jsonify({"error": " ".join(errors)}), 400

    assumptions = ModelAssumptions(**{**base, **updates})
    model = build_model(assumptions)

    response = {
        "assumptions": asdict(model["assumptions"]),
        "income_statement": model["income_statement"],
        "balance_sheet": model["balance_sheet"],
        "cash_flow": model["cash_flow"],
        "schedules": model["schedules"],
        "kpis": model["kpis"],
    }
    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
