import { templates } from "./templates.js";
import { mapTemplateToCanonical, validateThreeStatementOutput } from "./schema.js";

const templateSelect = document.querySelector("#template-select");
const outputContainer = document.querySelector("#template-output");
const validationStatus = document.querySelector("#validation-status");

const renderTemplate = (templateId) => {
  const template = templates.find((item) => item.id === templateId);
  if (!template) {
    outputContainer.textContent = "Template not found.";
    validationStatus.textContent = "";
    return;
  }

  const canonical = mapTemplateToCanonical(template);
  const validation = validateThreeStatementOutput(canonical);

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

loadTemplates();
