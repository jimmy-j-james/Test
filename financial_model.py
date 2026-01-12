"""Real estate financial model with statements, schedules, and KPIs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class ModelAssumptions:
    hold_years: int = 5
    purchase_price: float = 10_000_000.0
    rent: float = 1_200_000.0
    other_income: float = 50_000.0
    rent_growth: float = 0.03
    vacancy_rate: float = 0.05
    operating_expenses: float = 450_000.0
    expense_growth: float = 0.025
    capex_percent_revenue: float = 0.02
    working_capital_percent_revenue: float = 0.01
    capex_basis: str = "effective_gross_income"
    working_capital_basis: str = "effective_gross_income"
    debt_ltv: float = 0.7
    debt_interest_rate: float = 0.055
    debt_amort_years: int = 30
    debt_term_years: int = 5
    debt_interest_only_years: int = 0
    exit_cap_rate: float = 0.055
    sales_cost_percent: float = 0.02
    discount_rate: float = 0.10
    balance_sheet_valuation: str = "market"


def _annual_payment(principal: float, rate: float, years: int) -> float:
    if years <= 0:
        return 0.0
    if rate == 0:
        return principal / years
    return principal * rate / (1 - (1 + rate) ** (-years))


def _basis_value(row: Dict[str, float], basis: str) -> float:
    if basis == "gross_revenue":
        return row["gross_revenue"]
    if basis == "effective_gross_income":
        return row.get("effective_gross_income", row["net_revenue"])
    if basis == "noi":
        return row["noi"]
    raise ValueError(f"Unsupported basis: {basis}")


def build_debt_schedule(assumptions: ModelAssumptions) -> List[Dict[str, float]]:
    loan_amount = assumptions.purchase_price * assumptions.debt_ltv
    schedule: List[Dict[str, float]] = []
    annual_payment = _annual_payment(
        loan_amount,
        assumptions.debt_interest_rate,
        assumptions.debt_amort_years,
    )
    balance = loan_amount
    for year in range(1, assumptions.hold_years + 1):
        interest = balance * assumptions.debt_interest_rate
        if year <= assumptions.debt_interest_only_years:
            principal = 0.0
        else:
            principal = max(0.0, annual_payment - interest)
            principal = min(principal, balance)
        if assumptions.debt_term_years and year == assumptions.debt_term_years:
            principal = balance
        ending = balance - principal
        schedule.append(
            {
                "year": year,
                "begin_balance": balance,
                "interest": interest,
                "principal": principal,
                "ending_balance": ending,
                "debt_service": interest + principal,
            }
        )
        balance = ending
    return schedule


def build_operating_schedule(assumptions: ModelAssumptions) -> List[Dict[str, float]]:
    schedule: List[Dict[str, float]] = []
    rent = assumptions.rent
    other_income = assumptions.other_income
    expenses = assumptions.operating_expenses
    for year in range(1, assumptions.hold_years + 1):
        gross_revenue = rent + other_income
        vacancy = gross_revenue * assumptions.vacancy_rate
        net_revenue = gross_revenue - vacancy
        noi = net_revenue - expenses
        schedule.append(
            {
                "year": year,
                "gross_revenue": gross_revenue,
                "vacancy": vacancy,
                "net_revenue": net_revenue,
                "effective_gross_income": net_revenue,
                "operating_expenses": expenses,
                "noi": noi,
            }
        )
        rent *= 1 + assumptions.rent_growth
        other_income *= 1 + assumptions.rent_growth
        expenses *= 1 + assumptions.expense_growth
    return schedule


def build_capex_schedule(
    operating_schedule: List[Dict[str, float]],
    assumptions: ModelAssumptions,
) -> List[Dict[str, float]]:
    return [
        {
            "year": row["year"],
            "capex": _basis_value(row, assumptions.capex_basis)
            * assumptions.capex_percent_revenue,
        }
        for row in operating_schedule
    ]


def build_working_capital_schedule(
    operating_schedule: List[Dict[str, float]],
    assumptions: ModelAssumptions,
) -> List[Dict[str, float]]:
    schedule: List[Dict[str, float]] = []
    prior_wc = 0.0
    for row in operating_schedule:
        wc = (
            _basis_value(row, assumptions.working_capital_basis)
            * assumptions.working_capital_percent_revenue
        )
        change_wc = wc - prior_wc
        schedule.append(
            {"year": row["year"], "working_capital": wc, "change": change_wc}
        )
        prior_wc = wc
    return schedule


def build_income_statement(
    operating_schedule: List[Dict[str, float]],
) -> List[Dict[str, float]]:
    return [
        {
            "year": row["year"],
            "revenue": row["net_revenue"],
            "operating_expenses": row["operating_expenses"],
            "noi": row["noi"],
        }
        for row in operating_schedule
    ]


def build_cash_flow(
    operating_schedule: List[Dict[str, float]],
    capex_schedule: List[Dict[str, float]],
    working_capital_schedule: List[Dict[str, float]],
    debt_schedule: List[Dict[str, float]],
    assumptions: ModelAssumptions,
) -> List[Dict[str, float]]:
    cash_flow: List[Dict[str, float]] = []
    acquisition_equity = assumptions.purchase_price * (1 - assumptions.debt_ltv)
    cash_flow.append(
        {
            "year": 0,
            "equity_cash_flow": -acquisition_equity,
            "net_cash_flow": -assumptions.purchase_price,
        }
    )

    for index, row in enumerate(operating_schedule):
        capex = capex_schedule[index]["capex"]
        wc_change = working_capital_schedule[index]["change"]
        debt_service = debt_schedule[index]["debt_service"]
        equity_cash_flow = row["noi"] - capex - wc_change - debt_service
        cash_flow.append(
            {
                "year": row["year"],
                "equity_cash_flow": equity_cash_flow,
                "net_cash_flow": row["noi"] - capex - wc_change,
            }
        )

    if not operating_schedule:
        return cash_flow

    terminal_year = assumptions.hold_years
    last_year = operating_schedule[-1]
    exit_gross_revenue = last_year["gross_revenue"] * (1 + assumptions.rent_growth)
    exit_vacancy = exit_gross_revenue * assumptions.vacancy_rate
    exit_net_revenue = exit_gross_revenue - exit_vacancy
    exit_expenses = last_year["operating_expenses"] * (1 + assumptions.expense_growth)
    exit_noi = exit_net_revenue - exit_expenses
    if assumptions.exit_cap_rate <= 0:
        raise ValueError("exit_cap_rate must be greater than 0")
    sale_price = exit_noi / assumptions.exit_cap_rate
    sale_costs = sale_price * assumptions.sales_cost_percent
    debt_payoff = debt_schedule[-1]["ending_balance"]
    net_sale = sale_price - sale_costs - debt_payoff
    cash_flow[-1]["equity_cash_flow"] += net_sale
    cash_flow[-1]["net_cash_flow"] += sale_price - sale_costs
    cash_flow[-1]["sale_price"] = sale_price
    cash_flow[-1]["net_sale_proceeds"] = net_sale
    cash_flow[-1]["terminal_year"] = terminal_year

    return cash_flow


def build_balance_sheet(
    operating_schedule: List[Dict[str, float]],
    capex_schedule: List[Dict[str, float]],
    working_capital_schedule: List[Dict[str, float]],
    debt_schedule: List[Dict[str, float]],
    assumptions: ModelAssumptions,
) -> List[Dict[str, float]]:
    balance_sheet: List[Dict[str, float]] = []
    property_value = assumptions.purchase_price
    accumulated_capex = 0.0
    for index, row in enumerate(operating_schedule):
        accumulated_capex += capex_schedule[index]["capex"]
        if assumptions.balance_sheet_valuation == "market":
            if assumptions.exit_cap_rate <= 0:
                raise ValueError("exit_cap_rate must be greater than 0")
            property_value = row["noi"] / assumptions.exit_cap_rate
        elif assumptions.balance_sheet_valuation == "cost":
            property_value = assumptions.purchase_price + accumulated_capex
        else:
            raise ValueError(
                "balance_sheet_valuation must be 'market' or 'cost'"
            )
        working_capital = working_capital_schedule[index]["working_capital"]
        debt_balance = debt_schedule[index]["ending_balance"]
        assets = property_value + working_capital
        equity = assets - debt_balance
        balance_sheet.append(
            {
                "year": row["year"],
                "property_value": property_value,
                "working_capital": working_capital,
                "assets": assets,
                "debt": debt_balance,
                "equity": equity,
            }
        )
    return balance_sheet


def _npv(rate: float, cash_flows: List[float]) -> float:
    return sum(cf / (1 + rate) ** idx for idx, cf in enumerate(cash_flows))


def _irr(cash_flows: List[float], guess: float = 0.1) -> Optional[float]:
    rate = guess
    for _ in range(50):
        npv_value = 0.0
        d_npv = 0.0
        for idx, cf in enumerate(cash_flows):
            denom = (1 + rate) ** idx
            npv_value += cf / denom
            if idx > 0:
                d_npv -= idx * cf / ((1 + rate) ** (idx + 1))
        if d_npv == 0:
            break
        next_rate = rate - npv_value / d_npv
        if abs(next_rate - rate) < 1e-6:
            return next_rate
        rate = next_rate

    low = -0.99
    high = 0.5
    npv_low = _npv(low, cash_flows)
    npv_high = _npv(high, cash_flows)
    for _ in range(20):
        if npv_low == 0:
            return low
        if npv_high == 0:
            return high
        if npv_low * npv_high < 0:
            break
        high += 0.5
        npv_high = _npv(high, cash_flows)
    else:
        return None

    for _ in range(100):
        mid = (low + high) / 2
        npv_mid = _npv(mid, cash_flows)
        if abs(npv_mid) < 1e-6:
            return mid
        if npv_low * npv_mid < 0:
            high = mid
            npv_high = npv_mid
        else:
            low = mid
            npv_low = npv_mid
    return (low + high) / 2


def compute_kpis(
    cash_flow: List[Dict[str, float]],
    operating_schedule: List[Dict[str, float]],
    debt_schedule: List[Dict[str, float]],
    assumptions: ModelAssumptions,
) -> Dict[str, float]:
    equity_cash_flows = [row["equity_cash_flow"] for row in cash_flow]
    irr = _irr(equity_cash_flows)
    total_distributions = sum(cf for cf in equity_cash_flows if cf > 0)
    total_equity = -sum(cf for cf in equity_cash_flows if cf < 0)
    moic = total_distributions / total_equity if total_equity else 0.0

    dscr_values = []
    for index, _ in enumerate(cash_flow[1:]):
        noi = operating_schedule[index]["noi"]
        debt_service = debt_schedule[index]["debt_service"]
        if debt_service > 0:
            dscr_values.append(noi / debt_service)
    dscr = min(dscr_values) if dscr_values else 0.0

    npv_value = _npv(assumptions.discount_rate, equity_cash_flows)
    return {
        "irr": irr if irr is not None else 0.0,
        "moic": moic,
        "dscr": dscr,
        "npv": npv_value,
    }


def build_model(assumptions: Optional[ModelAssumptions] = None) -> Dict[str, object]:
    assumptions = assumptions or ModelAssumptions()
    operating_schedule = build_operating_schedule(assumptions)
    debt_schedule = build_debt_schedule(assumptions)
    capex_schedule = build_capex_schedule(operating_schedule, assumptions)
    working_capital_schedule = build_working_capital_schedule(
        operating_schedule, assumptions
    )
    income_statement = build_income_statement(operating_schedule)
    cash_flow = build_cash_flow(
        operating_schedule,
        capex_schedule,
        working_capital_schedule,
        debt_schedule,
        assumptions,
    )
    balance_sheet = build_balance_sheet(
        operating_schedule,
        capex_schedule,
        working_capital_schedule,
        debt_schedule,
        assumptions,
    )
    kpis = compute_kpis(cash_flow, operating_schedule, debt_schedule, assumptions)
    return {
        "assumptions": assumptions,
        "income_statement": income_statement,
        "balance_sheet": balance_sheet,
        "cash_flow": cash_flow,
        "schedules": {
            "debt": debt_schedule,
            "capex": capex_schedule,
            "working_capital": working_capital_schedule,
        },
        "kpis": kpis,
    }


__all__ = [
    "ModelAssumptions",
    "build_model",
    "build_income_statement",
    "build_balance_sheet",
    "build_cash_flow",
    "build_debt_schedule",
    "build_capex_schedule",
    "build_working_capital_schedule",
    "compute_kpis",
]
