export interface WeeklyData {
    Sun: number;
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
  }
  
  export interface MonthlyData {
    [key: string]: number;
  }
  
  export interface HistoryResponse {
    weekly: WeeklyData;
    monthly: MonthlyData;
  }