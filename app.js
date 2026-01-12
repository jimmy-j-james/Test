const modeButtons = document.querySelectorAll(".mode-card");
const modePanels = {
  natural: document.getElementById("mode-natural"),
  structured: document.getElementById("mode-structured"),
  research: document.getElementById("mode-research"),
};
const parseButton = document.getElementById("parse-nl");
const reviewTable = document.getElementById("review-table");
const saveReview = document.getElementById("save-review");
const output = document.getElementById("output");

const fields = [
  { key: "projectName", label: "Project name" },
  { key: "goal", label: "Goal" },
  { key: "timeline", label: "Timeline" },
  { key: "budget", label: "Budget" },
];

const state = {
  mode: "natural",
  data: Object.fromEntries(
    fields.map((field) => [
      field.key,
      {
        value: "",
        confidence: 0,
        provenance: "",
        confirmed: false,
        sourceChoice: "",
      },
    ]),
  ),
};

const setMode = (mode) => {
  state.mode = mode;
  Object.entries(modePanels).forEach(([key, panel]) => {
    panel.hidden = key !== mode;
  });
  modeButtons.forEach((button) => {
    button.classList.toggle("mode-card--active", button.dataset.mode === mode);
  });
};

const parseNaturalLanguage = (text) => {
  const parsed = {};
  const lower = text.toLowerCase();

  const budgetMatch = text.match(/\$?\s?(\d+(?:,\d{3})*(?:\.\d+)?)(k|m)?/i);
  if (budgetMatch) {
    const suffix = budgetMatch[2] || "";
    parsed.budget = {
      value: `$${budgetMatch[1]}${suffix}`,
      confidence: suffix ? 0.86 : 0.72,
      provenance: "natural-language",
    };
  }

  const timelineMatch = text.match(/by\s+([A-Za-z]+\s+\d{1,2}|Q\d\s+\d{4}|\w+\s+\d{4})/i);
  if (timelineMatch) {
    parsed.timeline = {
      value: timelineMatch[1],
      confidence: 0.78,
      provenance: "natural-language",
    };
  }

  const goalMatch = text.match(/(build|create|deliver|prepare|design|launch)\s+([^,.]+)/i);
  if (goalMatch) {
    parsed.goal = {
      value: `${goalMatch[1]} ${goalMatch[2]}`.trim(),
      confidence: 0.67,
      provenance: "natural-language",
    };
  }

  if (lower.includes("project") || lower.includes("plan")) {
    const nameMatch = text.match(/(?:project|plan)\s+(?:called|named)?\s?([^,.]+)/i);
    if (nameMatch) {
      parsed.projectName = {
        value: nameMatch[1].trim(),
        confidence: 0.64,
        provenance: "natural-language",
      };
    }
  }

  return parsed;
};

const mergeParsed = (parsed) => {
  fields.forEach((field) => {
    const current = state.data[field.key];
    const next = parsed[field.key];
    if (next) {
      state.data[field.key] = {
        ...current,
        value: next.value,
        confidence: next.confidence,
        provenance: next.provenance,
        confirmed: next.confidence >= 0.75,
        sourceChoice: "",
      };
    }
  });
};

const updateFromStructured = () => {
  document.querySelectorAll("[data-field]").forEach((input) => {
    const key = input.dataset.field;
    state.data[key].value = input.value.trim();
    state.data[key].confidence = input.value.trim() ? 0.95 : 0;
    state.data[key].provenance = input.value.trim() ? "structured" : "";
    state.data[key].confirmed = Boolean(input.value.trim());
    state.data[key].sourceChoice = "";
  });
};

const updateFromResearch = () => {
  const researchText = document.getElementById("research-input").value.trim();
  if (!researchText) {
    return;
  }
  state.data.goal = {
    value: researchText,
    confidence: 0.7,
    provenance: "research-assist",
    confirmed: false,
    sourceChoice: "",
  };
};

const renderReview = () => {
  reviewTable.innerHTML = "";
  fields.forEach((field) => {
    const record = state.data[field.key];
    const row = document.createElement("div");
    row.className = "review-row";

    const label = document.createElement("div");
    label.className = "review-label";
    label.textContent = field.label;

    const valueWrap = document.createElement("div");
    valueWrap.className = "review-value";

    const input = document.createElement("input");
    input.type = "text";
    input.value = record.value;
    input.placeholder = "Add value";
    input.addEventListener("input", (event) => {
      record.value = event.target.value;
      record.confidence = event.target.value ? 0.9 : 0;
      record.provenance = event.target.value ? record.provenance || "manual" : "";
      record.confirmed = Boolean(event.target.value);
      record.sourceChoice = "";
      renderReview();
    });

    const confidence = document.createElement("span");
    confidence.className = "confidence";
    const percent = Math.round(record.confidence * 100);
    confidence.textContent = record.confidence ? `${percent}% confidence` : "Missing";
    confidence.dataset.level = record.confidence >= 0.8 ? "high" : record.confidence >= 0.5 ? "medium" : "low";

    const provenance = document.createElement("div");
    provenance.className = "provenance";
    provenance.textContent = record.provenance ? `Source: ${record.provenance}` : "Source: unassigned";

    const confirm = document.createElement("label");
    confirm.className = "confirm";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = record.confirmed;
    checkbox.addEventListener("change", (event) => {
      record.confirmed = event.target.checked;
      renderReview();
    });
    confirm.append(checkbox, document.createTextNode(" Confirm"));

    valueWrap.append(input, confidence, provenance, confirm);

    if (!record.value) {
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="">Choose source for missing value</option>
        <option value="manual">Manual entry</option>
        <option value="public">Public data</option>
        <option value="assumed">Assumed</option>
      `;
      select.value = record.sourceChoice;
      select.addEventListener("change", (event) => {
        record.sourceChoice = event.target.value;
        record.provenance = event.target.value ? `missing-${event.target.value}` : "";
        renderReview();
      });
      valueWrap.append(select);
    }

    row.append(label, valueWrap);
    reviewTable.append(row);
  });
};

parseButton.addEventListener("click", () => {
  const text = document.getElementById("nl-input").value.trim();
  const parsed = parseNaturalLanguage(text);
  mergeParsed(parsed);
  renderReview();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    if (button.dataset.mode === "structured") {
      updateFromStructured();
    }
    if (button.dataset.mode === "research") {
      updateFromResearch();
    }
    renderReview();
  });
});

saveReview.addEventListener("click", () => {
  const payload = {
    mode: state.mode,
    fields: state.data,
  };
  output.textContent = JSON.stringify(payload, null, 2);
});

setMode("natural");
renderReview();
