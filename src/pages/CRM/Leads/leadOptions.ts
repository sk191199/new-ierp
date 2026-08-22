export const leadSourceOptions = ["Website", "Referral", "LinkedIn", "Campaign", "Partner"].map((value) => ({
  value,
  label: value,
}));

export const leadStatusOptions = ["New", "Qualified", "Disqualified"].map((value) => ({
  value,
  label: value,
}));

export const leadAssigneeOptions = ["Priya Sharma", "Liam Walker", "Arjun Rao"].map((value) => ({
  value,
  label: value,
}));

// API INTEGRATION: The current create/update contract uses this seeded user
// UUID, while the form displays the corresponding existing assignee option.
export const leadAssigneeIdMap = {
  "3fa85f64-5717-4562-b3fc-2c963f66afa6": "Priya Sharma",
} as const;

const predefinedIndustries = [
  "Technology",
  "Logistics",
  "Retail",
  "Energy",
  "Marine",
  "Construction",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Education",
  "Hospitality",
  "Telecommunications",
  "Agriculture",
  "Real Estate",
  "Automotive",
];

const customIndustries: string[] = [];

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

export const getLeadIndustryOptions = () => toOptions([...predefinedIndustries, ...customIndustries]);

export const addCustomIndustry = (name: string): string => {
  const next = name.trim();
  const exists = [...predefinedIndustries, ...customIndustries].some(
    (item) => item.toLowerCase() === next.toLowerCase(),
  );
  if (!exists && next) {
    customIndustries.push(next);
  }
  return next;
};

export const leadIndustryOptions = getLeadIndustryOptions();

export const leadFollowUpTypeOptions = ["Call", "Email", "Meeting", "Site Visit"].map((value) => ({
  value,
  label: value,
}));

export const leadFollowUpStatus = ["Pending", "Completed", "Rescheduled", "Cancelled"].map((value) => ({
  value,
  label: value,
}));

export const leadProjectOptions = ["Implementation", "Expansion", "Upgrade", "Greenfield", "Assessment"].map(
  (value) => ({ value, label: value }),
);

export const leadSizeOptions = ["11-50", "51-200", "201-500", "501-1000", "1000+"].map((value) => ({
  value,
  label: value,
}));

export const leadRevenueOptions = ["$1M-$5M", "$5M-$10M", "$10M-$50M", "$50M-$100M", "$100M+"].map((value) => ({
  value,
  label: value,
}));

export const leadSubsidiaryOptions = ["i-ERP India", "i-ERP US", "i-ERP Europe", "i-ERP MEA"].map((value) => ({
  value,
  label: value,
}));
