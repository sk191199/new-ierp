export type UomStatus = "Active" | "Inactive";

export interface UomRecord {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: UomStatus;
  description: string;
  inactive: boolean;
  decimalPrecision: number;
  notes: string;
}

export const uomMockData: UomRecord[] = [
  { id: "UOM-001", code: "PCS", name: "Piece", symbol: "pcs", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-002", code: "KG", name: "Kilogram", symbol: "kg", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-003", code: "G", name: "Gram", symbol: "g", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-004", code: "M", name: "Meter", symbol: "m", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-005", code: "L", name: "Liter", symbol: "l", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-006", code: "BOX", name: "Box", symbol: "box", description: "", inactive: false, status: "Active", decimalPrecision: 2, notes: "" },
  { id: "UOM-007", code: "CTN", name: "Carton", symbol: "ctn", description: "", inactive: true, status: "Inactive", decimalPrecision: 2, notes: "" },
];