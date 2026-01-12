import { FieldMetadata, Provenance, ValidationRule } from "./base_model";

export type RealEstateSchema = {
  acquisition: {
    purchasePrice: FieldMetadata<number>;
    closingCostsPct: FieldMetadata<number>;
    acquisitionDate: FieldMetadata<string>;
  };
  rentRoll: {
    numberOfUnits: FieldMetadata<number>;
    averageMonthlyRent: FieldMetadata<number>;
    rentGrowthRate: FieldMetadata<number>;
  };
  vacancy: {
    vacancyRate: FieldMetadata<number>;
    lossToLeasePct: FieldMetadata<number>;
  };
  operatingExpenses: {
    propertyTaxes: FieldMetadata<number>;
    insurance: FieldMetadata<number>;
    maintenance: FieldMetadata<number>;
    managementFeePct: FieldMetadata<number>;
  };
  capitalExpenditures: {
    recurringCapex: FieldMetadata<number>;
    replacementReservePerUnit: FieldMetadata<number>;
  };
  debt: {
    loanToValue: FieldMetadata<number>;
    interestRate: FieldMetadata<number>;
    amortizationYears: FieldMetadata<number>;
    interestOnlyYears: FieldMetadata<number>;
  };
  saleAssumptions: {
    exitCapRate: FieldMetadata<number>;
    saleCostsPct: FieldMetadata<number>;
    holdPeriodYears: FieldMetadata<number>;
  };
};

const currencyRule: ValidationRule = { type: "currency", min: 0 };
const percentRule: ValidationRule = { type: "percent", min: 0, max: 1 };
const yearsRule: ValidationRule = { type: "number", min: 0, max: 30 };

const assumedBaseline: Provenance = "assumed_baseline";

export const realEstateSchema: RealEstateSchema = {
  acquisition: {
    purchasePrice: {
      label: "Purchase price",
      defaultValue: 12500000,
      units: "currency",
      required: true,
      validation: currencyRule,
      provenance: "user_input",
    },
    closingCostsPct: {
      label: "Closing costs",
      defaultValue: 0.02,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: assumedBaseline,
    },
    acquisitionDate: {
      label: "Acquisition date",
      defaultValue: "2025-03-31",
      units: "date",
      required: true,
      validation: { type: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      provenance: "user_input",
    },
  },
  rentRoll: {
    numberOfUnits: {
      label: "Number of units",
      defaultValue: 120,
      units: "units",
      required: true,
      validation: { type: "number", min: 1, max: 10000 },
      provenance: "public_data",
    },
    averageMonthlyRent: {
      label: "Average monthly rent",
      defaultValue: 1800,
      units: "currency",
      required: true,
      validation: currencyRule,
      provenance: "public_data",
    },
    rentGrowthRate: {
      label: "Annual rent growth",
      defaultValue: 0.03,
      units: "percent",
      required: false,
      validation: percentRule,
      provenance: assumedBaseline,
    },
  },
  vacancy: {
    vacancyRate: {
      label: "Physical vacancy rate",
      defaultValue: 0.05,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: "public_data",
    },
    lossToLeasePct: {
      label: "Loss-to-lease",
      defaultValue: 0.01,
      units: "percent",
      required: false,
      validation: percentRule,
      provenance: assumedBaseline,
    },
  },
  operatingExpenses: {
    propertyTaxes: {
      label: "Property taxes",
      defaultValue: 180000,
      units: "currency",
      required: true,
      validation: currencyRule,
      provenance: "public_data",
    },
    insurance: {
      label: "Insurance",
      defaultValue: 75000,
      units: "currency",
      required: true,
      validation: currencyRule,
      provenance: assumedBaseline,
    },
    maintenance: {
      label: "Maintenance",
      defaultValue: 90000,
      units: "currency",
      required: true,
      validation: currencyRule,
      provenance: assumedBaseline,
    },
    managementFeePct: {
      label: "Management fee",
      defaultValue: 0.04,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: assumedBaseline,
    },
  },
  capitalExpenditures: {
    recurringCapex: {
      label: "Recurring CapEx",
      defaultValue: 60000,
      units: "currency",
      required: false,
      validation: currencyRule,
      provenance: assumedBaseline,
    },
    replacementReservePerUnit: {
      label: "Replacement reserve per unit",
      defaultValue: 300,
      units: "currency",
      required: false,
      validation: currencyRule,
      provenance: assumedBaseline,
    },
  },
  debt: {
    loanToValue: {
      label: "Loan-to-value",
      defaultValue: 0.65,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: "user_input",
    },
    interestRate: {
      label: "Interest rate",
      defaultValue: 0.055,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: "public_data",
    },
    amortizationYears: {
      label: "Amortization term",
      defaultValue: 30,
      units: "years",
      required: true,
      validation: yearsRule,
      provenance: assumedBaseline,
    },
    interestOnlyYears: {
      label: "Interest-only period",
      defaultValue: 2,
      units: "years",
      required: false,
      validation: yearsRule,
      provenance: assumedBaseline,
    },
  },
  saleAssumptions: {
    exitCapRate: {
      label: "Exit cap rate",
      defaultValue: 0.055,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: assumedBaseline,
    },
    saleCostsPct: {
      label: "Sale costs",
      defaultValue: 0.03,
      units: "percent",
      required: true,
      validation: percentRule,
      provenance: assumedBaseline,
    },
    holdPeriodYears: {
      label: "Hold period",
      defaultValue: 5,
      units: "years",
      required: true,
      validation: yearsRule,
      provenance: "user_input",
    },
  },
};
