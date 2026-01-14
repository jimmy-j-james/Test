const form = document.getElementById("assumptions-form");
const output = document.getElementById("output");
const exportButton = document.getElementById("export-json");
const kpiGrid = document.getElementById("kpi-grid");

let latestModel = null;

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const formatPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${(value * 100).toFixed(2)}%`;
};

const renderKpis = (kpis) => {
  kpiGrid.innerHTML = "";
  const cards = [
    { label: "IRR", value: formatPercent(kpis.irr) },
    { label: "MOIC", value: kpis.moic?.toFixed(2) ?? "-" },
    { label: "DSCR", value: kpis.dscr?.toFixed(2) ?? "-" },
    { label: "NPV", value: formatCurrency(kpis.npv) },
  ];

  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "kpi-card";

    const label = document.createElement("span");
    label.className = "kpi-label";
    label.textContent = card.label;

    const value = document.createElement("span");
    value.className = "kpi-value";
    value.textContent = card.value;

    item.append(label, value);
    kpiGrid.append(item);
  });
};

const buildPayload = (formData) => {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, value]),
  );
};

const runModel = async (payload) => {
  const response = await fetch("/api/model", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to run model.");
  }

  return response.json();
};

const downloadJson = (model) => {
  const blob = new Blob([JSON.stringify(model, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "real-estate-model.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  output.textContent = "Running model...";
  exportButton.disabled = true;
  latestModel = null;

  const formData = new FormData(form);
  const payload = buildPayload(formData);

  try {
    const model = await runModel(payload);
    latestModel = model;
    renderKpis(model.kpis);
    output.textContent = JSON.stringify(model, null, 2);
    exportButton.disabled = false;
  } catch (error) {
    output.textContent = error.message;
  }
});

exportButton.addEventListener("click", () => {
  if (!latestModel) {
    return;
  }
  downloadJson(latestModel);
});
