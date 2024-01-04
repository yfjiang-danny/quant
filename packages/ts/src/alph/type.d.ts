export interface AlphApiParams extends Record<string, unknown> {
  function: string;
}

export type SeriesType = "open" | "close" | "high" | "low";
export type IntervalType =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "60min"
  | "daily"
  | "weekly"
  | "monthly";
