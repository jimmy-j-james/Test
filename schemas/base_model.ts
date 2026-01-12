export type Provenance = "user_input" | "public_data" | "assumed_baseline";

export type ValidationRule = {
  type: "number" | "string" | "date" | "percent" | "currency" | "boolean";
  min?: number;
  max?: number;
  pattern?: string;
  allowedValues?: string[];
};

export type FieldMetadata<T> = {
  label: string;
  defaultValue: T;
  units: string;
  required: boolean;
  validation: ValidationRule;
  provenance: Provenance;
};

export type BaseModelSchema = {
  timeHorizon: {
    startDate: FieldMetadata<string>;
    projectionYears: FieldMetadata<number>;
    fiscalYearEndMonth: FieldMetadata<number>;
  };
  revenueDrivers: {
    startingRevenue: FieldMetadata<number>;
    growthRate: FieldMetadata<number>;
    pricePerUnit: FieldMetadata<number>;
    volumeUnits: FieldMetadata<number>;
  };
  costs: {
    costOfGoodsSoldPct: FieldMetadata<number>;
    operatingExpenses: FieldMetadata<number>;
    payroll: FieldMetadata<number>;
  };
  debt: {
    openingBalance: FieldMetadata<number>;
    interestRate: FieldMetadata<number>;
    termYears: FieldMetadata<number>;
    repaymentType: FieldMetadata<string>;
  };
  taxes: {
    taxRate: FieldMetadata<number>;
    netOperatingLossCarryforward: FieldMetadata<number>;
  };
  workingCapital: {
    daysSalesOutstanding: FieldMetadata<number>;
    daysPayableOutstanding: FieldMetadata<number>;
    daysInventoryOutstanding: FieldMetadata<number>;
  };
  exitAssumptions: {
    exitMultiple: FieldMetadata<number>;
    exitYear: FieldMetadata<number>;
  };
};

export const baseModelSchema: BaseModelSchema = {
  timeHorizon: {
    startDate: {
      label: "Model start date",
      defaultValue: "2025-01-01",
      units: "date",
      required: true,
      validation: { type: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      provenance: "user_input",
    },
    projectionYears: {
      label: "Projection length",
      defaultValue: 5,
      units: "years",
      required: true,
      validation: { type: "number", min: 1, max: 30 },
      provenance: "assumed_baseline",
    },
    fiscalYearEndMonth: {
      label: "Fiscal year end month",
      defaultValue: 12,
      units: "month",
      required: true,
      validation: { type: "number", min: 1, max: 12 },
      provenance: "assumed_baseline",
    },
  },
  revenueDrivers: {
    startingRevenue: {
      label: "Starting annual revenue",
      defaultValue: 1000000,
      units: "currency",
      required: true,
      validation: { type: "currency", min: 0 },
      provenance: "user_input",
    },
    growthRate: {
      label: "Annual revenue growth rate",
      defaultValue: 0.05,
      units: "percent",
      required: true,
      validation: { type: "percent", min: -0.5, max: 1 },
      provenance: "assumed_baseline",
    },
    pricePerUnit: {
      label: "Price per unit",
      defaultValue: 100,
      units: "currency",
      required: false,
      validation: { type: "currency", min: 0 },
      provenance: "user_input",
    },
    volumeUnits: {
      label: "Units sold",
      defaultValue: 10000,
      units: "units",
      required: false,
      validation: { type: "number", min: 0 },
      provenance: "user_input",
    },
  },
  costs: {
    costOfGoodsSoldPct: {
      label: "COGS as % of revenue",
      defaultValue: 0.4,
      units: "percent",
      required: true,
      validation: { type: "percent", min: 0, max: 1 },
      provenance: "assumed_baseline",
    },
    operatingExpenses: {
      label: "Operating expenses",
      defaultValue: 250000,
      units: "currency",
      required: true,
      validation: { type: "currency", min: 0 },
      provenance: "assumed_baseline",
    },
    payroll: {
      label: "Payroll",
      defaultValue: 300000,
      units: "currency",
      required: false,
      validation: { type: "currency", min: 0 },
      provenance: "assumed_baseline",
    },
  },
  debt: {
    openingBalance: {
      label: "Opening debt balance",
      defaultValue: 2000000,
      units: "currency",
      required: true,
      validation: { type: "currency", min: 0 },
      provenance: "user_input",
    },
    interestRate: {
      label: "Interest rate",
      defaultValue: 0.06,
      units: "percent",
      required: true,
      validation: { type: "percent", min: 0, max: 1 },
      provenance: "public_data",
    },
    termYears: {
      label: "Debt term",
      defaultValue: 7,
      units: "years",
      required: true,
      validation: { type: "number", min: 1, max: 30 },
      provenance: "user_input",
    },
    repaymentType: {
      label: "Repayment type",
      defaultValue: "amortizing",
      units: "string",
      required: true,
      validation: { type: "string", allowedValues: ["amortizing", "interest_only", "bullet"] },
      provenance: "assumed_baseline",
    },
  },
  taxes: {
    taxRate: {
      label: "Effective tax rate",
      defaultValue: 0.25,
      units: "percent",
      required: true,
      validation: { type: "percent", min: 0, max: 1 },
      provenance: "public_data",
    },
    netOperatingLossCarryforward: {
      label: "NOL carryforward",
      defaultValue: 0,
      units: "currency",
      required: false,
      validation: { type: "currency", min: 0 },
      provenance: "user_input",
    },
  },
  workingCapital: {
    daysSalesOutstanding: {
      label: "Days sales outstanding",
      defaultValue: 45,
      units: "days",
      required: true,
      validation: { type: "number", min: 0, max: 365 },
      provenance: "assumed_baseline",
    },
    daysPayableOutstanding: {
      label: "Days payable outstanding",
      defaultValue: 30,
      units: "days",
      required: true,
      validation: { type: "number", min: 0, max: 365 },
      provenance: "assumed_baseline",
    },
    daysInventoryOutstanding: {
      label: "Days inventory outstanding",
      defaultValue: 20,
      units: "days",
      required: false,
      validation: { type: "number", min: 0, max: 365 },
      provenance: "assumed_baseline",
    },
  },
  exitAssumptions: {
    exitMultiple: {
      label: "Exit EBITDA multiple",
      defaultValue: 8,
      units: "x",
      required: true,
      validation: { type: "number", min: 1, max: 25 },
      provenance: "assumed_baseline",
    },
    exitYear: {
      label: "Exit year",
      defaultValue: 5,
      units: "year",
      required: true,
      validation: { type: "number", min: 1, max: 30 },
      provenance: "assumed_baseline",
    },
  },
};
