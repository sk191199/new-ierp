export type SalesEnquiryStatus = "Open" | "Quotation" | "Converted" | "Lost" | "Cancelled";

export interface SalesEnquiry {
  id: string;
  enquiryId: string;
  opportunity: string;
  customer: string;
  contact: string;
  probability: number;
  expectedClose: string;
  status: SalesEnquiryStatus;
  winLoss: "Won" | "Lost" | "-";
  subsidiary: string;
}

const seeds: Array<Omit<SalesEnquiry, "id" | "enquiryId">> = [
  { opportunity: "S1-OPP-00063", customer: "Globex", contact: "+91 9876543210", probability: 75, expectedClose: "2026-09-15", status: "Open", winLoss: "-", subsidiary: "i-ERP India" },
  { opportunity: "S1-OPP-00064", customer: "Acme Corp", contact: "+91 9876543211", probability: 60, expectedClose: "2026-09-20", status: "Quotation", winLoss: "-", subsidiary: "i-ERP India" },
  { opportunity: "S1-OPP-00065", customer: "Nova Technologies", contact: "+91 9876543212", probability: 90, expectedClose: "2026-09-25", status: "Converted", winLoss: "Won", subsidiary: "i-ERP India" },
  { opportunity: "S1-OPP-00066", customer: "BlueOrbit", contact: "+1 415 882 4402", probability: 45, expectedClose: "2026-09-28", status: "Open", winLoss: "-", subsidiary: "i-ERP US" },
  { opportunity: "S1-OPP-00067", customer: "NorthWind", contact: "+44 20 7946 1003", probability: 30, expectedClose: "2026-10-02", status: "Lost", winLoss: "Lost", subsidiary: "i-ERP Europe" },
  { opportunity: "S1-OPP-00068", customer: "GreenField Energy", contact: "+971 50 441 1004", probability: 80, expectedClose: "2026-10-05", status: "Quotation", winLoss: "-", subsidiary: "i-ERP MEA" },
  { opportunity: "S1-OPP-00069", customer: "Apex Retail", contact: "+44 161 555 1008", probability: 55, expectedClose: "2026-10-09", status: "Open", winLoss: "-", subsidiary: "i-ERP Europe" },
  { opportunity: "S1-OPP-00070", customer: "Vertex Marine", contact: "+1 713 555 1005", probability: 20, expectedClose: "2026-10-12", status: "Cancelled", winLoss: "-", subsidiary: "i-ERP US" },
  { opportunity: "S1-OPP-00071", customer: "Skyline Infra", contact: "+91 98840 11006", probability: 85, expectedClose: "2026-10-15", status: "Converted", winLoss: "Won", subsidiary: "i-ERP India" },
  { opportunity: "S1-OPP-00072", customer: "Harbor Steel", contact: "+234 802 555 1010", probability: 40, expectedClose: "2026-10-18", status: "Open", winLoss: "-", subsidiary: "i-ERP MEA" },
];

export const salesEnquiryRecords: SalesEnquiry[] = Array.from({ length: 35 }, (_, index) => {
  const seed = seeds[index % seeds.length];
  const sequence = index + 1;
  return {
    ...seed,
    id: `sales-enquiry-${sequence}`,
    enquiryId: `SE-${String(sequence).padStart(5, "0")}`,
    opportunity: `${seed.opportunity.slice(0, -2)}${String(63 + index).padStart(2, "0")}`,
    expectedClose: new Date(new Date(seed.expectedClose).getTime() + Math.floor(index / seeds.length) * 7 * 86_400_000)
      .toISOString()
      .slice(0, 10),
  };
});
