
import { RegionalResult, RepresentedBase, EntitySummary, FinancialData } from './types';

export const SYSTEM_COLORS = {
  primary: '#15803d', 
  secondary: '#dc2626',
  accent: '#fde68a',
  revenue: '#16a34a',
  expense: '#dc2626',
  balance: '#2563eb'
};

// Valores zerados para nova importação
export const EXECUTIVE_TOTALS = {
  totalRevenue: 0,      
  totalExpense: 0,      
  totalBalance: 0,      
  financialRevenue: 0,   
  operationalRevenue: 0,
  operationalBalance: 0  
};

export const CONSOLIDATED_MONTHLY_DATA: FinancialData[] = [];

export const SECOVI_PR_RESULTS: RegionalResult[] = [];

export const UNIHAB_MONTHLY_DATA: FinancialData[] = [];

export const INPESPAR_MONTHLY_DATA: FinancialData[] = [];

export const CMA_MONTHLY_DATA: FinancialData[] = [];

export const SECOVIMED_CWB_MONTHLY: FinancialData[] = [];

export const SECOVIMED_LDB_MONTHLY: FinancialData[] = [];

export const SECOVIMED_MGA_MONTHLY: FinancialData[] = [];
