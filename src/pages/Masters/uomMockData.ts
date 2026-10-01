export type UomStatus = "Active" | "Inactive";

export interface UomRecord {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: UomStatus;
}

export const uomMockData: UomRecord[] = [
  { id: "UOM-001", code: "PCS", name: "Piece", symbol: "pcs", status: "Active" },
  { id: "UOM-002", code: "KG", name: "Kilogram", symbol: "kg", status: "Active" },
  { id: "UOM-003", code: "G", name: "Gram", symbol: "g", status: "Active" },
  { id: "UOM-004", code: "M", name: "Meter", symbol: "m", status: "Active" },
  { id: "UOM-005", code: "L", name: "Liter", symbol: "l", status: "Active" },
  { id: "UOM-006", code: "BOX", name: "Box", symbol: "box", status: "Active" },
  { id: "UOM-007", code: "CTN", name: "Carton", symbol: "ctn", status: "Inactive" },
];