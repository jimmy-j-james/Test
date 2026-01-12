import { templates } from "./templates.js";
import { mapTemplateToCanonical, validateThreeStatementOutput } from "./schema.js";

const templateSelect = document.querySelector("#template-select");
const outputContainer = document.querySelector("#template-output");
const validationStatus = document.querySelector("#validation-status");
const exportButton = document.querySelector("#export-excel");

let currentCanonical = null;

const flattenToRows = (value, prefix = "") => {
  const rows = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPrefix = `${prefix}[${index}]`;
      rows.push(...flattenToRows(item, nextPrefix));
    });
    return rows;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      rows.push(...flattenToRows(item, nextPrefix));
    });
    return rows;
  }

  rows.push({ path: prefix, value: value ?? "" });
  return rows;
};

const escapeCsv = (value) => {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const downloadCsv = (canonical, templateId) => {
  if (!canonical) {
    return;
  }

  const rows = flattenToRows(canonical);
  const lines = ["Path,Value", ...rows.map((row) => `${escapeCsv(row.path)},${escapeCsv(row.value)}`)];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${templateId || "model"}-output.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const renderTemplate = (templateId) => {
  const template = templates.find((item) => item.id === templateId);
  if (!template) {
    outputContainer.textContent = "Template not found.";
    validationStatus.textContent = "";
    currentCanonical = null;
    return;
  }

  const canonical = mapTemplateToCanonical(template);
  const validation = validateThreeStatementOutput(canonical);

  currentCanonical = canonical;
  outputContainer.textContent = JSON.stringify(canonical, null, 2);
  validationStatus.textContent = validation.valid
    ? "✅ 3-statement output validated."
    : `⚠️ Issues: ${validation.issues.join(" ")}`;
};

const loadTemplates = () => {
  templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = `${template.label} (${template.assetType.replace("_", " ")})`;
    templateSelect.appendChild(option);
  });

  templateSelect.value = templates[0]?.id ?? "";
  renderTemplate(templateSelect.value);
};

templateSelect.addEventListener("change", (event) => {
  renderTemplate(event.target.value);
});

exportButton.addEventListener("click", () => {
  downloadCsv(currentCanonical, templateSelect.value);
});

loadTemplates();
