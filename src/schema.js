export const canonicalSchema = {
  templateId: "",
  name: "",
  assetType: "",
  drivers: {},
  statements: {
    incomeStatement: {},
    balanceSheet: {},
    cashFlow: {},
  },
};

export const mapTemplateToCanonical = (template) => {
  return {
    ...canonicalSchema,
    templateId: template.id,
    name: template.label,
    assetType: template.assetType,
    drivers: { ...template.drivers },
    statements: {
      incomeStatement: { ...template.defaults.incomeStatement },
      balanceSheet: { ...template.defaults.balanceSheet },
      cashFlow: { ...template.defaults.cashFlow },
    },
  };
};

export const validateThreeStatementOutput = (canonicalTemplate) => {
  const statements = canonicalTemplate.statements;
  if (!statements) {
    return { valid: false, issues: ["Missing statements section."] };
  }

  const requiredStatements = ["incomeStatement", "balanceSheet", "cashFlow"];
  const issues = requiredStatements.flatMap((statement) => {
    if (!statements[statement]) {
      return `Missing ${statement} data.`;
    }

    const values = Object.values(statements[statement]);
    if (values.length === 0) {
      return `No values in ${statement}.`;
    }

    return [];
  });

  return { valid: issues.length === 0, issues };
};
