
export interface FinancialData {
  month: string;
  revenue: number;
  expense: number;
  balance: number;
}

export interface RegionalResult {
  name: string;
  accumulated: {
    revenue: number;
    expense: number;
    balance: number;
  };
  monthly: FinancialData[];
}

export interface EntitySummary {
  name: string;
  revenue: number;
  expense: number;
  balance: number;
}

export interface RepresentedBase {
  region: string;
  condos: number;
  companies: number;
  realEstate: number;
  total: number;
  associatedPct: number;
}
