export type SubsidiaryStatus = "Active" | "Inactive";

export interface SubsidiaryRecord {
  id: string;
  name: string;
  status: SubsidiaryStatus;
  hasChildSubsidiary: boolean;
  stateProvince: string;
  country: string;
  legalName: string;
  parentSubsidiaryId: string;
  currency: string;
}

export const subsidiaryMockData: SubsidiaryRecord[] = [
  {
    id: "SUB-001",
    name: "Northstar Demo Holdings",
    status: "Active",
    hasChildSubsidiary: true,
    stateProvince: "Delaware",
    country: "United States",
    legalName: "Northstar Demo Holdings, Inc.",
    parentSubsidiaryId: "",
    currency: "USD",
  },
  {
    id: "SUB-002",
    name: "Northstar Demo India",
    status: "Active",
    hasChildSubsidiary: false,
    stateProvince: "Karnataka",
    country: "India",
    legalName: "Northstar Demo India Private Limited",
    parentSubsidiaryId: "SUB-001",
    currency: "INR",
  },
  {
    id: "SUB-003",
    name: "Northstar Demo Europe",
    status: "Active",
    hasChildSubsidiary: false,
    stateProvince: "Dublin",
    country: "Ireland",
    legalName: "Northstar Demo Europe Limited",
    parentSubsidiaryId: "SUB-001",
    currency: "EUR",
  },
  {
    id: "SUB-004",
    name: "Northstar Demo UK",
    status: "Inactive",
    hasChildSubsidiary: false,
    stateProvince: "England",
    country: "United Kingdom",
    legalName: "Northstar Demo UK Limited",
    parentSubsidiaryId: "SUB-001",
    currency: "GBP",
  },
  {
    id: "SUB-005",
    name: "Northstar Demo Middle East",
    status: "Active",
    hasChildSubsidiary: false,
    stateProvince: "Dubai",
    country: "United Arab Emirates",
    legalName: "Northstar Demo Middle East FZ-LLC",
    parentSubsidiaryId: "SUB-001",
    currency: "AED",
  },
  {
    id: "SUB-006",
    name: "Northstar Demo Singapore",
    status: "Active",
    hasChildSubsidiary: false,
    stateProvince: "Singapore",
    country: "Singapore",
    legalName: "Northstar Demo Singapore Pte. Ltd.",
    parentSubsidiaryId: "SUB-001",
    currency: "SGD",
  },
];