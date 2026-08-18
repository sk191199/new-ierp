import type { Lead } from "@/models/lead/lead";

export const getLeadKpis = (items: Lead[]) => {
  const qualified = items.filter((lead) => lead.status === "Qualified").length;
  const disqualified = items.filter((lead) => lead.status === "Disqualified").length;
  const average =
    items.length === 0 ? 0 : items.reduce((sum, lead) => sum + lead.leadScore, 0) / items.length;

  return {
    total: items.length,
    qualified,
    disqualified,
    averageScore: Number(average.toFixed(1)),
  };
};
