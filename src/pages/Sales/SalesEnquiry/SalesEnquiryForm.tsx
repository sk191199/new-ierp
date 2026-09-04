// import AddIcon from "@mui/icons-material/Add";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
// import {
//   Box,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Stack,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";
// import { FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
// import { FormSection } from "@/components/forms/FormSection";
// import type { SalesEnquiry, SalesEnquiryStatus } from "./salesEnquiry.mock";

// export interface SalesEnquiryDraft {
//   enquiryCode: string;
//   customer: string;
//   contactPerson: string;
//   opportunity: string;
//   email: string;
//   phone: string;
//   altPhone: string;
//   probability: string;
//   title: string;
//   expectedClose: string;
//   status: SalesEnquiryStatus;
//   winLossReason: string;
//   projectedTotal: string;
//   forecastType: string;
//   weightedTotal: string;
//   range: string;
//   subsidiary: string;
//   className: string;
//   location: string;
//   department: string;
//   salesRep: string;
//   lastSalesActivity: string;
//   currency: string;
//   exchangeRate: string;
//   payment: string;
//   prices: string;
//   delivery: string;
//   createInitialFollowUp: boolean;
//   followUpDate: string;
//   nextFollowUpDate: string;
//   followUpStatus: string;
//   activityType: string;
//   remarks: string;
//   attachment: File | null;
// }

// interface SalesEnquiryItem {
//   category: string;
//   item: string;
//   description: string;
//   quantity: string;
//   uom: string;
//   priceLevel: string;
//   rate: string;
//   discount: string;
//   amount: string;
//   taxCode: string;
//   grossAmount: string;
//   className: string;
//   countryOfOrigin: string;
//   hsCode: string;
// }

// export const createSalesEnquiryDraft = (record?: SalesEnquiry): SalesEnquiryDraft => ({
//   enquiryCode: record?.enquiryId ?? "TEA-ENQ-00056",
//   customer: record?.customer ?? "",
//   contactPerson: "",
//   opportunity: record?.opportunity ?? "",
//   email: "",
//   phone: record?.contact ?? "",
//   altPhone: "",
//   probability: record ? String(record.probability) : "10",
//   title: "",
//   expectedClose: record?.expectedClose ?? "",
//   status: record?.status ?? "Open",
//   winLossReason: record?.winLoss && record.winLoss !== "-" ? record.winLoss : "",
//   projectedTotal: "",
//   forecastType: "",
//   weightedTotal: "",
//   range: "",
//   subsidiary: record?.subsidiary ?? "i-ERP India",
//   className: "",
//   location: "",
//   department: "Admin",
//   salesRep: "",
//   lastSalesActivity: "",
//   currency: "EUR - EURO",
//   exchangeRate: "0.67755",
//   payment: "Payment Due within 30 days of Invoice",
//   prices: "Prices valid for 30 days within quotation date",
//   delivery: "Delivery within two weeks of order confirmation.",
//   createInitialFollowUp: true,
//   followUpDate: new Date().toISOString().slice(0, 10),
//   nextFollowUpDate: "",
//   followUpStatus: "Pending",
//   activityType: "Call",
//   remarks: "",
//   attachment: null,
// });

// interface SalesEnquiryFormProps {
//   value: SalesEnquiryDraft;
//   mode: "create" | "edit";
//   submitting: boolean;
//   onChange: (value: SalesEnquiryDraft) => void;
//   onSubmit: () => void;
//   onCancel: () => void;
// }

// const customerOptions = ["Globex", "Acme Corp", "Nova Technologies", "BlueOrbit", "NorthWind"].map((value) => ({ value, label: value }));
// const statusOptions = ["Open", "Quotation", "Converted", "Lost", "Cancelled"].map((value) => ({ value, label: value }));
// const subsidiaryOptions = ["i-ERP India", "i-ERP US", "i-ERP Europe", "i-ERP MEA"].map((value) => ({ value, label: value }));
// const forecastOptions = ["Conservative", "Expected", "Optimistic"].map((value) => ({ value, label: value }));
// const classOptions = ["Standard", "Priority", "Strategic"].map((value) => ({ value, label: value }));
// const locationOptions = ["Bengaluru", "Mumbai", "Dubai", "Singapore"].map((value) => ({ value, label: value }));
// const activityOptions = ["Call", "Email", "Meeting", "Site Visit"].map((value) => ({ value, label: value }));
// const followUpStatusOptions = ["Pending", "Completed", "Rescheduled", "Cancelled"].map((value) => ({ value, label: value }));

// export const SalesEnquiryForm = ({ value, mode, submitting, onChange, onSubmit, onCancel }: SalesEnquiryFormProps) => {
//   const [tab, setTab] = useState(0);
//   const [attempted, setAttempted] = useState(false);
//   const patch = <K extends keyof SalesEnquiryDraft>(key: K, next: SalesEnquiryDraft[K]) => onChange({ ...value, [key]: next });
//   const requiredError = (field: string, fieldValue: string) => attempted && !fieldValue.trim() ? `${field} is required.` : undefined;

//   return (
//     <Stack component="form" gap={2} sx={{ "& .MuiAccordion-root.Mui-expanded": { borderColor: "divider", boxShadow: "none" } }} onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (value.customer.trim() && value.contactPerson.trim() && value.expectedClose.trim() && value.department.trim()) onSubmit(); }}>
//       <FormSection title="Primary Information" collapsible defaultExpanded>
//         <FieldGrid>
//           {/* <TextFieldControl name="enquiryCode" label="Enquiry Code" value={value.enquiryCode} onChange={(next) => patch("enquiryCode", next)} readOnly /> */}
//           <SelectField name="customer" label="Customer" value={value.customer} onChange={(next) => patch("customer", next)} options={customerOptions} error={requiredError("Customer", value.customer)} required />
//           <TextFieldControl name="contactPerson" label="Contact Person" value={value.contactPerson} onChange={(next) => patch("contactPerson", next)} error={requiredError("Contact person", value.contactPerson)} required />
//           <SelectField name="opportunity" label="Opportunity (Optional)" value={value.opportunity} onChange={(next) => patch("opportunity", next)} options={customerOptions.map((item) => ({ ...item, label: `Search ${item.label}` }))} includeEmpty />
//           <TextFieldControl name="email" label="Email" type="email" value={value.email} onChange={(next) => patch("email", next)} />
//           <TextFieldControl name="phone" label="Phone" type="tel" value={value.phone} onChange={(next) => patch("phone", next)} />
//           <TextFieldControl name="altPhone" label="Alt Phone" type="tel" value={value.altPhone} onChange={(next) => patch("altPhone", next)} />
//           <SelectField name="status" label="Status" value={value.status} onChange={(next) => patch("status", next as SalesEnquiryStatus)} options={statusOptions} />
//           <TextFieldControl name="probability" label="Probability (%)" type="number" value={value.probability} onChange={(next) => patch("probability", next)} />
//           <TextFieldControl name="title" label="Title" value={value.title} onChange={(next) => patch("title", next)} />
//           <TextFieldControl name="expectedClose" label="Expected Close Date" type="date" value={value.expectedClose} onChange={(next) => patch("expectedClose", next)} error={requiredError("Expected close date", value.expectedClose)} required />
//           <SelectField name="winLossReason" label="Win / Loss Reason" value={value.winLossReason} onChange={(next) => patch("winLossReason", next)} options={[{ value: "Won", label: "Won" }, { value: "Lost", label: "Lost" }]} includeEmpty />
//           <TextFieldControl name="additionalDetails" label="Additional Details" multiline minRows={3} value={value.remarks} onChange={(next) => patch("remarks", next)} />
//         </FieldGrid>
//       </FormSection>

//       <FormSection title="Forecasting" collapsible defaultExpanded>
//         <FieldGrid>
//           <TextFieldControl name="projectedTotal" label="Projected Total" type="number" value={value.projectedTotal} onChange={(next) => patch("projectedTotal", next)} />
//           <SelectField name="forecastType" label="Forecast Type" value={value.forecastType} onChange={(next) => patch("forecastType", next)} options={forecastOptions} includeEmpty />
//           <TextFieldControl name="weightedTotal" label="Weighted Total" value={value.weightedTotal} onChange={(next) => patch("weightedTotal", next)} readOnly />
//           <TextFieldControl name="range" label="Range" value={value.range} onChange={(next) => patch("range", next)} readOnly />
//         </FieldGrid>
//       </FormSection>

//       <FormSection title="Classification" collapsible defaultExpanded>
//         <FieldGrid>
//           <SelectField name="subsidiary" label="Subsidiary" value={value.subsidiary} onChange={(next) => patch("subsidiary", next)} options={subsidiaryOptions} />
//           <SelectField name="className" label="Class" value={value.className} onChange={(next) => patch("className", next)} options={classOptions} includeEmpty />
//           <SelectField name="location" label="Location" value={value.location} onChange={(next) => patch("location", next)} options={locationOptions} includeEmpty />
//           <TextFieldControl name="department" label="Department" value={value.department} onChange={(next) => patch("department", next)} error={requiredError("Department", value.department)} required />
//           <TextFieldControl name="salesRep" label="Sales Rep" value={value.salesRep} onChange={(next) => patch("salesRep", next)} />
//           <TextFieldControl name="lastSalesActivity" label="Last Sales Activity" type="date" value={value.lastSalesActivity} onChange={(next) => patch("lastSalesActivity", next)} />
//         </FieldGrid>
//       </FormSection>

//       <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2.5, overflow: "hidden", bgcolor: "background.paper" }}>
//         <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons={false} sx={{ bgcolor: "chrome.sidebar", color: "chrome.sidebarText", minHeight: 42 }}>
//           {["Items", "Terms and Conditions", "Follow-Ups", "Related Records"].map((label) => <Tab key={label} label={label} sx={{ minHeight: 42, color: "inherit", fontSize: "0.72rem", fontWeight: 700, textTransform: "none", "&.Mui-selected": { color: "primary.contrastText" } }} />)}
//         </Tabs>
//         <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
//           {tab === 0 ? <ItemsTab value={value} onChange={patch} /> : null}
//           {tab === 1 ? <TermsTab value={value} onChange={patch} /> : null}
//           {tab === 2 ? <FollowUpsTab value={value} onChange={patch} /> : null}
//           {tab === 3 ? <Typography variant="body2" color="text.secondary">Related records will appear here when Sales Enquiry integrations are connected.</Typography> : null}
//         </Box>
//       </Box>

//       <Stack direction="row" justifyContent="flex-end" gap={1}>
//         <Button type="button" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={onCancel} disabled={submitting}>Cancel</Button>
//         <Button type="submit" variant="contained" color="error" startIcon={<SaveOutlinedIcon />} disabled={submitting}>{mode === "create" ? "Save" : "Save Changes"}</Button>
//       </Stack>
//     </Stack>
//   );
// };

// const emptyItem = (): SalesEnquiryItem => ({
//   category: "",
//   item: "",
//   description: "",
//   quantity: "1",
//   uom: "",
//   priceLevel: "",
//   rate: "0",
//   discount: "0",
//   amount: "-",
//   taxCode: "",
//   grossAmount: "-",
//   className: "",
//   countryOfOrigin: "",
//   hsCode: "",
// });

// const itemSelectOptions = [{ value: "", label: "Select" }];

// const ItemsTab = ({ value, onChange }: { value: SalesEnquiryDraft; onChange: <K extends keyof SalesEnquiryDraft>(key: K, next: SalesEnquiryDraft[K]) => void }) => {
//   const [items, setItems] = useState<SalesEnquiryItem[]>([emptyItem()]);

//   const patchItem = (index: number, key: keyof SalesEnquiryItem, next: string) => {
//     setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: next } : item));
//   };

//   const itemFields: Array<{ key: keyof SalesEnquiryItem; label: string; type?: "text" | "number" }> = [
//     { key: "category", label: "Item Category" },
//     { key: "item", label: "Item" },
//     { key: "description", label: "Description" },
//     { key: "quantity", label: "Quantity", type: "number" },
//     { key: "uom", label: "UOM" },
//     { key: "priceLevel", label: "Price Level" },
//     { key: "rate", label: "Rate", type: "number" },
//     { key: "discount", label: "Discount %", type: "number" },
//     { key: "amount", label: "Amount" },
//     { key: "taxCode", label: "Tax Code" },
//     { key: "grossAmount", label: "Gross Amount" },
//     { key: "className", label: "Class" },
//     { key: "countryOfOrigin", label: "Country of Origin" },
//     { key: "hsCode", label: "HS Code" },
//   ];

//   return (
//     <Stack gap={2}>
//       <FieldGrid>
//         <SelectField name="currency" label="Currency" value={value.currency} onChange={(next) => onChange("currency", next)} options={[{ value: "EUR - EURO", label: "EUR - EURO" }, { value: "INR - RUPEE", label: "INR - RUPEE" }]} />
//         <TextFieldControl name="exchangeRate" label="Exchange Rate" value={value.exchangeRate} onChange={(next) => onChange("exchangeRate", next)} />
//       </FieldGrid>
//       <Box sx={{ overflowX: "auto", pb: 0.5 }}>
//         <Stack gap={1} sx={{ minWidth: 1340 }}>
//           <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.35fr .55fr .75fr .8fr .7fr .7fr .7fr .85fr .85fr .8fr 1fr .85fr", gap: 1, px: 1.25 }}>
//             {itemFields.map((field) => <Typography key={field.key} variant="caption" color="text.secondary" sx={{ fontSize: "0.66rem", fontWeight: 800 }}>{field.label}</Typography>)}
//           </Box>
//           {items.map((item, index) => (
//             <Box key={index} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.35fr .55fr .75fr .8fr .7fr .7fr .7fr .85fr .85fr .8fr 1fr .85fr", gap: 1, p: 1.25, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "action.hover", alignItems: "start" }}>
//               {itemFields.map((field) => field.key === "category" || field.key === "item" || field.key === "uom" || field.key === "priceLevel" || field.key === "taxCode" || field.key === "className" ? (
//                 <SelectField key={field.key} name={`item-${index}-${field.key}`} label="" value={item[field.key]} onChange={(next) => patchItem(index, field.key, next)} options={itemSelectOptions} includeEmpty />
//               ) : field.key === "amount" || field.key === "grossAmount" ? (
//                 <Typography key={field.key} variant="body2" color="text.secondary" sx={{ px: 1, pt: 1.25 }}>{item[field.key]}</Typography>
//               ) : (
//                 <TextFieldControl key={field.key} name={`item-${index}-${field.key}`} label="" type={field.type} value={item[field.key]} onChange={(next) => patchItem(index, field.key, next)} multiline={field.key === "description"} minRows={field.key === "description" ? 2 : undefined} />
//               ))}
//             </Box>
//           ))}
//         </Stack>
//       </Box>
//       <Button type="button" variant="contained" color="error" startIcon={<AddIcon />} onClick={() => setItems((current) => [...current, emptyItem()])} sx={{ alignSelf: "flex-start" }}>Add Item</Button>
//       <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" } }}>{["Invoiceable Subtotal", "Discount", "Tax Total", "Total Amount"].map((label) => <Box key={label} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1.5 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h3" sx={{ mt: 1 }}>EUR 0.00</Typography><Typography variant="caption" color="text.secondary">SGD 0.00</Typography></Box>)}</Box>
//     </Stack>
//   );
// };

// const TermsTab = ({ value, onChange }: { value: SalesEnquiryDraft; onChange: <K extends keyof SalesEnquiryDraft>(key: K, next: SalesEnquiryDraft[K]) => void }) => <FieldGrid><TextFieldControl name="payment" label="Payment" multiline minRows={4} value={value.payment} onChange={(next) => onChange("payment", next)} /><TextFieldControl name="prices" label="Prices" multiline minRows={4} value={value.prices} onChange={(next) => onChange("prices", next)} /><TextFieldControl name="delivery" label="Delivery" multiline minRows={4} value={value.delivery} onChange={(next) => onChange("delivery", next)} /></FieldGrid>;

// const FollowUpsTab = ({ value, onChange }: { value: SalesEnquiryDraft; onChange: <K extends keyof SalesEnquiryDraft>(key: K, next: SalesEnquiryDraft[K]) => void }) => <Stack gap={1.5}><FormControlLabel control={<Checkbox checked={value.createInitialFollowUp} onChange={(event) => onChange("createInitialFollowUp", event.target.checked)} />} label="Create initial follow-up" /><FieldGrid><TextFieldControl name="followUpDate" label="Date" type="date" value={value.followUpDate} onChange={(next) => onChange("followUpDate", next)} /><TextFieldControl name="nextFollowUpDate" label="Next Follow-Up Date" type="date" value={value.nextFollowUpDate} onChange={(next) => onChange("nextFollowUpDate", next)} /><SelectField name="followUpStatus" label="Status" value={value.followUpStatus} onChange={(next) => onChange("followUpStatus", next)} options={followUpStatusOptions} /><SelectField name="activityType" label="Activity Type" value={value.activityType} onChange={(next) => onChange("activityType", next)} options={activityOptions} /><TextFieldControl name="remarks" label="Remarks" multiline minRows={3} value={value.remarks} onChange={(next) => onChange("remarks", next)} /><TextField name="attachment" label="Attachment" type="file" fullWidth InputLabelProps={{ shrink: true }} onChange={(event) => onChange("attachment", (event.target as HTMLInputElement).files?.[0] ?? null)} /></FieldGrid></Stack>;



import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
import { FormSection } from "@/components/forms/FormSection";
import type { SalesEnquiry, SalesEnquiryStatus } from "./salesEnquiry.mock";

export interface SalesEnquiryDraft {
  enquiryCode: string;
  customer: string;
  contactPerson: string;
  opportunity: string;
  email: string;
  phone: string;
  altPhone: string;
  probability: string;
  title: string;
  expectedClose: string;
  status: SalesEnquiryStatus;
  winLossReason: string;
  projectedTotal: string;
  forecastType: string;
  weightedTotal: string;
  range: string;
  subsidiary: string;
  className: string;
  location: string;
  department: string;
  salesRep: string;
  lastSalesActivity: string;
  currency: string;
  exchangeRate: string;
  payment: string;
  prices: string;
  delivery: string;
  createInitialFollowUp: boolean;
  followUpDate: string;
  nextFollowUpDate: string;
  followUpStatus: string;
  activityType: string;
  remarks: string;
  attachment: File | null;
}

interface SalesEnquiryItem {
  category: string;
  item: string;
  description: string;
  quantity: string;
  uom: string;
  priceLevel: string;
  rate: string;
  discount: string;
  amount: string;
  taxCode: string;
  grossAmount: string;
  className: string;
  countryOfOrigin: string;
  hsCode: string;
}

export const createSalesEnquiryDraft = (record?: SalesEnquiry): SalesEnquiryDraft => ({
  enquiryCode: record?.enquiryId ?? "TEA-ENQ-00056",
  customer: record?.customer ?? "",
  contactPerson: "",
  opportunity: record?.opportunity ?? "",
  email: "",
  phone: record?.contact ?? "",
  altPhone: "",
  probability: record ? String(record.probability) : "10",
  title: "",
  expectedClose: record?.expectedClose ?? "",
  status: record?.status ?? "Open",
  winLossReason: record?.winLoss && record.winLoss !== "-" ? record.winLoss : "",
  projectedTotal: "",
  forecastType: "",
  weightedTotal: "",
  range: "",
  subsidiary: record?.subsidiary ?? "i-ERP India",
  className: "",
  location: "",
  department: "Admin",
  salesRep: "",
  lastSalesActivity: "",
  currency: "EUR - EURO",
  exchangeRate: "0.67755",
  payment: "Payment Due within 30 days of Invoice",
  prices: "Prices valid for 30 days within quotation date",
  delivery: "Delivery within two weeks of order confirmation.",
  createInitialFollowUp: true,
  followUpDate: new Date().toISOString().slice(0, 10),
  nextFollowUpDate: "",
  followUpStatus: "Pending",
  activityType: "Call",
  remarks: "",
  attachment: null,
});

interface SalesEnquiryFormProps {
  value: SalesEnquiryDraft;
  mode: "create" | "edit";
  submitting: boolean;
  onChange: (value: SalesEnquiryDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const customerOptions = [
  "Globex",
  "Acme Corp",
  "Nova Technologies",
  "BlueOrbit",
  "NorthWind",
].map((value) => ({ value, label: value }));

const statusOptions = ["Open", "Quotation", "Converted", "Lost", "Cancelled"].map(
  (value) => ({ value, label: value }),
);

const subsidiaryOptions = ["i-ERP India", "i-ERP US", "i-ERP Europe", "i-ERP MEA"].map(
  (value) => ({ value, label: value }),
);

const forecastOptions = ["Conservative", "Expected", "Optimistic"].map((value) => ({
  value,
  label: value,
}));

const classOptions = ["Standard", "Priority", "Strategic"].map((value) => ({
  value,
  label: value,
}));

const locationOptions = ["Bengaluru", "Mumbai", "Dubai", "Singapore"].map((value) => ({
  value,
  label: value,
}));

const activityOptions = ["Call", "Email", "Meeting", "Site Visit"].map((value) => ({
  value,
  label: value,
}));

const followUpStatusOptions = ["Pending", "Completed", "Rescheduled", "Cancelled"].map(
  (value) => ({ value, label: value }),
);

export const SalesEnquiryForm = ({
  value,
  mode,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: SalesEnquiryFormProps) => {
  const [tab, setTab] = useState(0);
  const [attempted, setAttempted] = useState(false);

  const patch = <K extends keyof SalesEnquiryDraft>(
    key: K,
    next: SalesEnquiryDraft[K],
  ) => onChange({ ...value, [key]: next });

  const requiredError = (field: string, fieldValue: string) =>
    attempted && !fieldValue.trim() ? `${field} is required.` : undefined;

  return (
    <Stack
      component="form"
      gap={2}
      sx={{
        "& .MuiAccordion-root.Mui-expanded": {
          borderColor: "divider",
          boxShadow: "none",
        },
      }}
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);

        if (
          value.customer.trim() &&
          value.contactPerson.trim() &&
          value.expectedClose.trim() &&
          value.department.trim()
        ) {
          onSubmit();
        }
      }}
    >
      <FormSection title="Primary Information" collapsible defaultExpanded>
        <FieldGrid>
          <SelectField
            name="customer"
            label="Customer"
            value={value.customer}
            onChange={(next) => patch("customer", next)}
            options={customerOptions}
            error={requiredError("Customer", value.customer)}
            required
          />

          <TextFieldControl
            name="contactPerson"
            label="Contact Person"
            value={value.contactPerson}
            onChange={(next) => patch("contactPerson", next)}
            error={requiredError("Contact person", value.contactPerson)}
            required
          />

          <SelectField
            name="opportunity"
            label="Opportunity (Optional)"
            value={value.opportunity}
            onChange={(next) => patch("opportunity", next)}
            options={customerOptions.map((item) => ({
              ...item,
              label: `Search ${item.label}`,
            }))}
            includeEmpty
          />

          <TextFieldControl
            name="email"
            label="Email"
            type="email"
            value={value.email}
            onChange={(next) => patch("email", next)}
          />

          <TextFieldControl
            name="phone"
            label="Phone"
            type="tel"
            value={value.phone}
            onChange={(next) => patch("phone", next)}
          />

          <TextFieldControl
            name="altPhone"
            label="Alt Phone"
            type="tel"
            value={value.altPhone}
            onChange={(next) => patch("altPhone", next)}
          />

          <SelectField
            name="status"
            label="Status"
            value={value.status}
            onChange={(next) => patch("status", next as SalesEnquiryStatus)}
            options={statusOptions}
          />

          <TextFieldControl
            name="probability"
            label="Probability (%)"
            type="number"
            value={value.probability}
            onChange={(next) => patch("probability", next)}
          />

          <TextFieldControl
            name="title"
            label="Title"
            value={value.title}
            onChange={(next) => patch("title", next)}
          />

          <TextFieldControl
            name="expectedClose"
            label="Expected Close Date"
            type="date"
            value={value.expectedClose}
            onChange={(next) => patch("expectedClose", next)}
            error={requiredError("Expected close date", value.expectedClose)}
            required
          />

          <SelectField
            name="winLossReason"
            label="Win / Loss Reason"
            value={value.winLossReason}
            onChange={(next) => patch("winLossReason", next)}
            options={[
              { value: "Won", label: "Won" },
              { value: "Lost", label: "Lost" },
            ]}
            includeEmpty
          />

          <TextFieldControl
            name="additionalDetails"
            label="Additional Details"
            multiline
            minRows={3}
            value={value.remarks}
            onChange={(next) => patch("remarks", next)}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Forecasting" collapsible defaultExpanded>
        <FieldGrid>
          <TextFieldControl
            name="projectedTotal"
            label="Projected Total"
            type="number"
            value={value.projectedTotal}
            onChange={(next) => patch("projectedTotal", next)}
          />

          <SelectField
            name="forecastType"
            label="Forecast Type"
            value={value.forecastType}
            onChange={(next) => patch("forecastType", next)}
            options={forecastOptions}
            includeEmpty
          />

          <TextFieldControl
            name="weightedTotal"
            label="Weighted Total"
            value={value.weightedTotal}
            onChange={(next) => patch("weightedTotal", next)}
            readOnly
          />

          <TextFieldControl
            name="range"
            label="Range"
            value={value.range}
            onChange={(next) => patch("range", next)}
            readOnly
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Classification" collapsible defaultExpanded>
        <FieldGrid>
          <SelectField
            name="subsidiary"
            label="Subsidiary"
            value={value.subsidiary}
            onChange={(next) => patch("subsidiary", next)}
            options={subsidiaryOptions}
          />

          <SelectField
            name="className"
            label="Class"
            value={value.className}
            onChange={(next) => patch("className", next)}
            options={classOptions}
            includeEmpty
          />

          <SelectField
            name="location"
            label="Location"
            value={value.location}
            onChange={(next) => patch("location", next)}
            options={locationOptions}
            includeEmpty
          />

          <TextFieldControl
            name="department"
            label="Department"
            value={value.department}
            onChange={(next) => patch("department", next)}
            error={requiredError("Department", value.department)}
            required
          />

          <TextFieldControl
            name="salesRep"
            label="Sales Rep"
            value={value.salesRep}
            onChange={(next) => patch("salesRep", next)}
          />

          <TextFieldControl
            name="lastSalesActivity"
            label="Last Sales Activity"
            type="date"
            value={value.lastSalesActivity}
            onChange={(next) => patch("lastSalesActivity", next)}
          />
        </FieldGrid>
      </FormSection>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, next) => setTab(next)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            bgcolor: "chrome.sidebar",
            color: "chrome.sidebarText",
            minHeight: 42,
          }}
        >
          {["Items", "Terms and Conditions", "Follow-Ups", "Related Records"].map(
            (label) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  minHeight: 42,
                  color: "inherit",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "none",
                  "&.Mui-selected": {
                    color: "primary.contrastText",
                  },
                }}
              />
            ),
          )}
        </Tabs>

        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {tab === 0 ? <ItemsTab value={value} onChange={patch} /> : null}
          {tab === 1 ? <TermsTab value={value} onChange={patch} /> : null}
          {tab === 2 ? <FollowUpsTab value={value} onChange={patch} /> : null}

          {tab === 3 ? (
            <Typography variant="body2" color="text.secondary">
              Related records will appear here when Sales Enquiry integrations are
              connected.
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Stack direction="row" justifyContent="flex-end" gap={1}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="error"
          startIcon={<SaveOutlinedIcon />}
          disabled={submitting}
        >
          {mode === "create" ? "Save" : "Save Changes"}
        </Button>
      </Stack>
    </Stack>
  );
};

const emptyItem = (): SalesEnquiryItem => ({
  category: "",
  item: "",
  description: "",
  quantity: "1",
  uom: "",
  priceLevel: "",
  rate: "0",
  discount: "0",
  amount: "-",
  taxCode: "",
  grossAmount: "-",
  className: "",
  countryOfOrigin: "",
  hsCode: "",
});

const itemSelectOptions = [{ value: "", label: "Select" }];

interface ItemCardProps {
  item: SalesEnquiryItem;
  index: number;
  totalItems: number;
  expanded: boolean;
  onToggleExpand: () => void;
  patchItem: (
    index: number,
    key: keyof SalesEnquiryItem,
    next: string,
  ) => void;
  removeItem: (index: number) => void;
}

const SECTION_HEADER = ({ title }: { title: string }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
    <Box sx={{ width: 5, height: 18, borderRadius: 10, bgcolor: "primary.main" }} />
    <Typography
      sx={{
        fontSize: "0.72rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "text.secondary",
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const ItemCard = ({
  item,
  index,
  totalItems,
  expanded,
  onToggleExpand,
  patchItem,
  removeItem,
}: ItemCardProps) => {
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      bgcolor: "background.paper",
    },
  };

  const itemName = item.item || "New Item";
  const itemQty = item.quantity || "-";
  const itemRate = item.rate || "-";
  const itemGross = item.grossAmount || "-";

  return (
    <Box
      sx={{
        position: "relative",
        border: 1,
        borderColor: "divider",
        borderRadius: 2.5,
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "all 200ms ease",
        "&:hover": {
          borderColor: "text.disabled",
          boxShadow: 1,
        },
      }}
    >
      {/* COLLAPSED HEADER */}
      <Box
        onClick={onToggleExpand}
        sx={{
          px: { xs: 1.5, md: 2 },
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          bgcolor: "action.hover",
          borderBottom: expanded ? 1 : 0,
          borderColor: "divider",
          cursor: "pointer",
          transition: "background-color 200ms ease",
          "&:hover": {
            bgcolor: "action.selected",
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0} flex={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 1.25,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: "0.72rem",
              fontWeight: 800,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </Box>

          <Box minWidth={0}>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                lineHeight: 1.2,
              }}
            >
              Item {String(index + 1).padStart(2, "0")}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {itemName}
            </Typography>
          </Box>

          {/* COLLAPSED SUMMARY (hidden when expanded) */}
          {!expanded && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{
                ml: 2,
                display: { xs: "none", sm: "flex" },
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                Qty {itemQty}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                Rate {itemRate}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: "0.75rem", fontWeight: 700, color: "primary.main" }}
              >
                {itemGross}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton
            type="button"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(index);
            }}
            disabled={totalItems === 1}
            aria-label={`Delete item ${index + 1}`}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.25,
              "&:hover": {
                borderColor: "error.main",
                color: "error.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>

          <IconButton
            type="button"
            size="small"
            onClick={onToggleExpand}
            sx={{
              flexShrink: 0,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}
            aria-label={expanded ? "Collapse item" : "Expand item"}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* EXPANDED CONTENT */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          {/* PRIMARY ITEM INFORMATION */}
          <Box>
            <SECTION_HEADER title="Item Information" />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.25fr" },
                gap: 1.25,
              }}
            >
              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-category`}
                  label="Item Category"
                  value={item.category}
                  onChange={(next) => patchItem(index, "category", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-item`}
                  label="Item"
                  value={item.item}
                  onChange={(next) => patchItem(index, "item", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" }, ...fieldSx }}>
                <TextFieldControl
                  name={`item-${index}-description`}
                  label="Description"
                  value={item.description}
                  onChange={(next) => patchItem(index, "description", next)}
                  multiline
                  minRows={2}
                />
              </Box>
            </Box>
          </Box>

          {/* COMMERCIAL DETAILS */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <SECTION_HEADER title="Quantity & Pricing" />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(3, 1fr)",
                  lg: "0.7fr 0.7fr 1fr 1fr 0.9fr",
                },
                gap: 1.25,
              }}
            >
              <Box sx={fieldSx}>
                <TextFieldControl
                  name={`item-${index}-quantity`}
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(next) => patchItem(index, "quantity", next)}
                />
              </Box>

              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-uom`}
                  label="UOM"
                  value={item.uom}
                  onChange={(next) => patchItem(index, "uom", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-priceLevel`}
                  label="Price Level"
                  value={item.priceLevel}
                  onChange={(next) => patchItem(index, "priceLevel", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={fieldSx}>
                <TextFieldControl
                  name={`item-${index}-rate`}
                  label="Rate"
                  type="number"
                  value={item.rate}
                  onChange={(next) => patchItem(index, "rate", next)}
                />
              </Box>

              <Box sx={fieldSx}>
                <TextFieldControl
                  name={`item-${index}-discount`}
                  label="Discount %"
                  type="number"
                  value={item.discount}
                  onChange={(next) => patchItem(index, "discount", next)}
                />
              </Box>
            </Box>
          </Box>

          {/* AMOUNT SUMMARY */}
          <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.25 }}>
            <AmountCard label="Amount" value={item.amount} />
            <AmountCard label="Gross Amount" value={item.grossAmount} highlighted />
          </Box>

          {/* TAX & CLASSIFICATION */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <SECTION_HEADER title="Tax & Classification" />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 1.25,
              }}
            >
              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-taxCode`}
                  label="Tax Code"
                  value={item.taxCode}
                  onChange={(next) => patchItem(index, "taxCode", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={fieldSx}>
                <SelectField
                  name={`item-${index}-className`}
                  label="Class"
                  value={item.className}
                  onChange={(next) => patchItem(index, "className", next)}
                  options={itemSelectOptions}
                  includeEmpty
                />
              </Box>

              <Box sx={fieldSx}>
                <TextFieldControl
                  name={`item-${index}-countryOfOrigin`}
                  label="Country of Origin"
                  value={item.countryOfOrigin}
                  onChange={(next) => patchItem(index, "countryOfOrigin", next)}
                />
              </Box>

              <Box sx={fieldSx}>
                <TextFieldControl
                  name={`item-${index}-hsCode`}
                  label="HS Code"
                  value={item.hsCode}
                  onChange={(next) => patchItem(index, "hsCode", next)}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

const AmountCard = ({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) => (
  <Box
    sx={{
      p: 1.5,
      border: 1,
      borderColor: highlighted ? "primary.main" : "divider",
      borderRadius: 1.75,
      bgcolor: highlighted ? "action.selected" : "action.hover",
      minHeight: 74,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontSize: "0.67rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.5,
        fontSize: "1rem",
        lineHeight: 1.2,
        fontWeight: 800,
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ItemsTab = ({
  value,
  onChange,
}: {
  value: SalesEnquiryDraft;
  onChange: <K extends keyof SalesEnquiryDraft>(
    key: K,
    next: SalesEnquiryDraft[K],
  ) => void;
}) => {
  const [items, setItems] = useState<SalesEnquiryItem[]>([emptyItem()]);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const patchItem = (
    index: number,
    key: keyof SalesEnquiryItem,
    next: string,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: next } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      const updated = current.filter((_, itemIndex) => itemIndex !== index);
      // Adjust expandedIndex if needed
      if (expandedIndex >= updated.length) {
        setExpandedIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const handleAddItem = () => {
    setItems((current) => [...current, emptyItem()]);
    // Set newly added item as expanded
    setExpandedIndex(items.length);
  };

  return (
    <Stack gap={2}>
      {/* CURRENCY */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <SelectField
          name="currency"
          label="Currency"
          value={value.currency}
          onChange={(next) => onChange("currency", next)}
          options={[
            { value: "EUR - EURO", label: "EUR - EURO" },
            { value: "INR - RUPEE", label: "INR - RUPEE" },
          ]}
        />

        <TextFieldControl
          name="exchangeRate"
          label="Exchange Rate"
          value={value.exchangeRate}
          onChange={(next) => onChange("exchangeRate", next)}
        />
      </Box>

      {/* ITEMS */}
      <Stack gap={1.5}>
        {items.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            index={index}
            totalItems={items.length}
            expanded={expandedIndex === index}
            onToggleExpand={() => handleToggleExpand(index)}
            patchItem={patchItem}
            removeItem={removeItem}
          />
        ))}
      </Stack>

      {/* ADD ITEM */}
      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            minHeight: 38,
            px: 2,
            borderRadius: 1.5,
            fontWeight: 700,
            textTransform: "none",
            borderStyle: "dashed",
          }}
        >
          Add another item
        </Button>
      </Box>

      {/* TOTALS */}
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {[
          "Invoiceable Subtotal",
          "Discount",
          "Tax Total",
          "Total Amount",
        ].map((label) => (
          <Box
            key={label}
            sx={{
              p: 1.5,
              border: 1,
              borderColor: "divider",
              borderRadius: 1.75,
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "1.25rem",
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              EUR 0.00
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.35, display: "block" }}
            >
              SGD 0.00
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

const TermsTab = ({
  value,
  onChange,
}: {
  value: SalesEnquiryDraft;
  onChange: <K extends keyof SalesEnquiryDraft>(
    key: K,
    next: SalesEnquiryDraft[K],
  ) => void;
}) => (
  <FieldGrid>
    <TextFieldControl
      name="payment"
      label="Payment"
      multiline
      minRows={4}
      value={value.payment}
      onChange={(next) => onChange("payment", next)}
    />

    <TextFieldControl
      name="prices"
      label="Prices"
      multiline
      minRows={4}
      value={value.prices}
      onChange={(next) => onChange("prices", next)}
    />

    <TextFieldControl
      name="delivery"
      label="Delivery"
      multiline
      minRows={4}
      value={value.delivery}
      onChange={(next) => onChange("delivery", next)}
    />
  </FieldGrid>
);

const FollowUpsTab = ({
  value,
  onChange,
}: {
  value: SalesEnquiryDraft;
  onChange: <K extends keyof SalesEnquiryDraft>(
    key: K,
    next: SalesEnquiryDraft[K],
  ) => void;
}) => (
  <Stack gap={1.5}>
    <FormControlLabel
      control={
        <Checkbox
          checked={value.createInitialFollowUp}
          onChange={(event) =>
            onChange("createInitialFollowUp", event.target.checked)
          }
        />
      }
      label="Create initial follow-up"
    />

    <FieldGrid>
      <TextFieldControl
        name="followUpDate"
        label="Date"
        type="date"
        value={value.followUpDate}
        onChange={(next) => onChange("followUpDate", next)}
      />

      <TextFieldControl
        name="nextFollowUpDate"
        label="Next Follow-Up Date"
        type="date"
        value={value.nextFollowUpDate}
        onChange={(next) => onChange("nextFollowUpDate", next)}
      />

      <SelectField
        name="followUpStatus"
        label="Status"
        value={value.followUpStatus}
        onChange={(next) => onChange("followUpStatus", next)}
        options={followUpStatusOptions}
      />

      <SelectField
        name="activityType"
        label="Activity Type"
        value={value.activityType}
        onChange={(next) => onChange("activityType", next)}
        options={activityOptions}
      />

      <TextFieldControl
        name="remarks"
        label="Remarks"
        multiline
        minRows={3}
        value={value.remarks}
        onChange={(next) => onChange("remarks", next)}
      />

      <TextField
        name="attachment"
        label="Attachment"
        type="file"
        fullWidth
        InputLabelProps={{ shrink: true }}
        onChange={(event) =>
          onChange(
            "attachment",
            (event.target as HTMLInputElement).files?.[0] ?? null,
          )
        }
      />
    </FieldGrid>
  </Stack>
);

