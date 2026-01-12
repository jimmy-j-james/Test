export const templates = [
  {
    id: "startup",
    label: "Startup",
    assetType: "startup",
    drivers: {
      growthRate: 0.35,
      churnRate: 0.08,
      runwayMonths: 18,
      cac: 1200,
    },
    defaults: {
      incomeStatement: {
        revenue: 150000,
        cogs: 45000,
        operatingExpenses: 80000,
      },
      balanceSheet: {
        assets: 300000,
        liabilities: 90000,
        equity: 210000,
      },
      cashFlow: {
        operating: -20000,
        investing: -50000,
        financing: 100000,
      },
    },
  },
  {
    id: "small-business",
    label: "Small Business",
    assetType: "small_business",
    drivers: {
      seasonalityIndex: 0.6,
      inventoryTurns: 4.2,
      avgTicketSize: 75,
      rentToRevenueRatio: 0.12,
    },
    defaults: {
      incomeStatement: {
        revenue: 420000,
        cogs: 210000,
        operatingExpenses: 150000,
      },
      balanceSheet: {
        assets: 500000,
        liabilities: 230000,
        equity: 270000,
      },
      cashFlow: {
        operating: 60000,
        investing: -15000,
        financing: -25000,
      },
    },
  },
];
