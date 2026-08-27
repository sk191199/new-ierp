import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import {
  readLeadCustomFields,
  readLeadFieldVisibility,
  readLeadFieldOrder,
  saveLeadFieldVisibility,
  saveLeadCustomFields,
  saveLeadFieldOrder,
  type LeadCustomField,
} from "@/pages/CRM/Leads/leadFieldOrder";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

const settingsSections = [
  { label: "General Workspace", icon: TuneOutlinedIcon },
  { label: "Screen Architect", icon: TuneOutlinedIcon },
  { label: "Workflow Architect", icon: HubOutlinedIcon },
  { label: "Print Architect", icon: DescriptionOutlinedIcon },
  { label: "Neural Transitions", icon: ArrowForwardIcon },
  { label: "Neural Security", icon: SecurityOutlinedIcon },
  { label: "Notification Purge", icon: NotificationsNoneOutlinedIcon },
  { label: "Neural Intelligence", icon: HubOutlinedIcon },
  { label: "User Access Control", icon: PersonOutlineOutlinedIcon },
  { label: "System Scheduling", icon: CalendarMonthOutlinedIcon },
];

const modules = [
  "System & Administration",
  "Sales & Distribution",
  "Procurement Hub",
  "Inventory & Supply Chain",
  "Finance & Treasury",
  "CRM & Customer Engagement",
  "HR & Payroll",
  "Project Management",
  "Manufacturing",
];

const screensByModule: Record<string, string[]> = {
  "System & Administration": ["Company (Tenant) Setup", "Subsidiaries", "Branches / Locations", "Document & Number Series", "Unit of Measure (UOM)"],
  "CRM & Customer Engagement": [
    "CRM Mission Control",
    "Lead Management",
    "Contact Directory",
    "Opportunity Pipeline",
    "Activities & Follow-Ups",
    "Campaign Manager",
  ],
};

const fallbackScreens = ["Overview", "Configuration"];

interface ArchitectField {
  label: string;
  id: string;
  type: string;
  required: boolean;
  visible: boolean;
}

interface ArchitectSection {
  title: string;
  description: string;
  fields: ArchitectField[];
}

const initialFields = ([
  {
    title: "Primary Information",
    description: "Capture the essential lead details.",
    fields: [
      ["Company Name", "companyName", "Text / Char", true],
      ["Contact Person", "contactPerson", "Text / Char", true],
      ["Phone Number", "phone", "Phone", true],
      ["Email", "email", "Email", true],
      ["Industry", "industry", "Select", false],
      ["Project Type", "projectType", "Select", false],
      ["Lead Source", "leadSource", "Select", false],
      ["Status", "status", "Select", true],
      ["Assigned To", "assignedTo", "Select", false],
      ["Website", "website", "URL", false],
      ["Company Size", "companySize", "Select", false],
      ["Annual Revenue", "annualRevenue", "Select", false],
      ["Address", "address", "Long Text", true],
    ],
  },
  {
    title: "Classification",
    description: "Map the lead to the correct subsidiary.",
    fields: [["Subsidiary", "subsidiary", "Select", false]],
  },
  {
    title: "Additional Information",
    description: "Capture context, scope and notes.",
    fields: [
      ["Project Description", "projectDescription", "Long Text", false],
      ["Notes", "notes", "Long Text", false],
    ],
  },
  {
    title: "Follow-ups",
    description: "Track follow-up activities and next actions.",
    fields: [
      ["Follow-up Date", "followUpDate", "Date", false],
      ["New Follow-up Date", "newFollowUpDate", "Date", false],
      ["Follow-up Type", "followUpType", "Select", false],
      ["Follow-up Status", "followUpStatus", "Select", false],
      ["Follow-up Notes", "followUpNotes", "Long Text", false],
      ["Follow-up File", "followUpFile", "File", false],
    ],
  },
 ] satisfies Array<{
  title: string;
  description: string;
  fields: Array<[string, string, string, boolean]>;
}>).map((section) => ({
  ...section,
  fields: section.fields.map(([label, id, type, required]) => ({ label, id, type, required, visible: true })),
})) satisfies ArchitectSection[];

const applySavedOrder = (sections: ArchitectSection[]): ArchitectSection[] => {
  const savedOrder = readLeadFieldOrder();
  const savedCustomFields = readLeadCustomFields();
  const savedVisibility = readLeadFieldVisibility();
  return sections.map((section) => {
    const sectionCustomFields = savedCustomFields
      .filter((field) => field.screen === "Lead Management" && field.section === section.title)
      .map((field) => ({ ...field, visible: savedVisibility[field.id] ?? true }));
    const sectionFields = [...section.fields, ...sectionCustomFields];
    const order =
      section.title === "Primary Information"
        ? savedOrder.primary
        : section.title === "Classification"
          ? savedOrder.classification
          : section.title === "Additional Information"
            ? savedOrder.additionalInformation
            : section.title === "Follow-ups"
              ? savedOrder.followUps
              : [];
    if (!order.length) {
      return { ...section, fields: sectionFields.map((field) => ({ ...field, visible: savedVisibility[field.id] ?? field.visible })) };
    }
    const originalRequiredPositions = new Map(
      sectionFields.map((field, index) => (field.required ? [index, field.id] : null)).filter(Boolean) as Array<[number, string]>,
    );
    const savedFields = order.map((id) => sectionFields.find((field) => field.id === id)).filter(Boolean) as ArchitectField[];
    const optionalFields = savedFields.filter((field) => !field.required);
    let optionalIndex = 0;

    return {
      ...section,
      fields: sectionFields.map((field, index) => {
        const requiredId = originalRequiredPositions.get(index);
        if (requiredId) {
          return { ...field, visible: savedVisibility[field.id] ?? field.visible };
        }
        const nextField = optionalFields[optionalIndex++] ?? field;
        return { ...nextField, visible: savedVisibility[nextField.id] ?? nextField.visible };
      }),
    };
  });
};

const dummyFields: ArchitectSection[] = [
  {
    title: "Configuration Fields",
    description: "This screen is reserved for a future configuration catalog.",
    fields: [{ label: "Description", id: "description", type: "Text / Char", required: false, visible: true }],
  },
];

export const SystemSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("Screen Architect");
  const [activeModule, setActiveModule] = useState("CRM & Customer Engagement");
  const [activeScreen, setActiveScreen] = useState("Lead Management");
  const [fields, setFields] = useState(() => applySavedOrder(initialFields));
  const [customFields, setCustomFields] = useState<LeadCustomField[]>(readLeadCustomFields);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [customFieldDraft, setCustomFieldDraft] = useState({ label: "", type: "Text / Char" as LeadCustomField["type"], required: false, screen: "Lead Management", section: "Additional Information" as LeadCustomField["section"] });
  const dispatch = useAppDispatch();

  const toggleField = (id: string) => {
    setFields((current) => current.map((section) => ({
      ...section,
      fields: section.fields.map((field) => (field.id === id ? { ...field, visible: !field.visible } : field)),
    })));
  };

  const selectModule = (module: string) => {
    setActiveModule(module);
    setActiveScreen((screensByModule[module] ?? fallbackScreens)[0]);
  };

  const reorderFields = (sectionTitle: string, sourceId: string, targetId: string) => {
    setFields((current) => {
      const next = current.map((section) => {
        if (section.title !== sectionTitle) {
          return section;
        }

        const sourceIndex = section.fields.findIndex((field) => field.id === sourceId);
        const targetIndex = section.fields.findIndex((field) => field.id === targetId);
        if (
          sourceIndex < 0 ||
          targetIndex < 0 ||
          sourceIndex === targetIndex ||
          section.fields[sourceIndex].required ||
          section.fields[targetIndex].required
        ) {
          return section;
        }

        const reordered = [...section.fields];
        const [moved] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        return { ...section, fields: reordered };
      });

      return next;
    });
  };

  const commitOrder = () => {
    if (activeModule !== "CRM & Customer Engagement" || activeScreen !== "Lead Management") {
      return;
    }
    saveLeadFieldOrder({
      primary: fields.find((section) => section.title === "Primary Information")?.fields.map((field) => field.id) ?? [],
      classification: fields.find((section) => section.title === "Classification")?.fields.map((field) => field.id) ?? [],
      additionalInformation:
        fields.find((section) => section.title === "Additional Information")?.fields.map((field) => field.id) ?? [],
      followUps: fields.find((section) => section.title === "Follow-ups")?.fields.map((field) => field.id) ?? [],
    });
    saveLeadFieldVisibility(Object.fromEntries(fields.flatMap((section) => section.fields.map((field) => [field.id, field.visible]))));
    saveLeadCustomFields(customFields);
    dispatch(toastShown({ message: "Lead Management architecture updated successfully.", severity: "success" }));
  };

  const revertOrder = () => setFields(applySavedOrder(initialFields));

  const addCustomField = () => {
    const label = customFieldDraft.label.trim();
    if (!label) {
      return;
    }
    const field = { ...customFieldDraft, id: `custom_${Date.now()}`, label };
    setCustomFields((current) => [...current, field]);
    if (field.screen === "Lead Management") {
      setFields((current) => current.map((section) =>
        section.title === field.section
          ? { ...section, fields: [...section.fields, { ...field, visible: true }] }
          : section,
      ));
    }
    setCustomFieldDraft({ label: "", type: "Text / Char", required: false, screen: "Lead Management", section: "Additional Information" });
    setCustomFieldDialogOpen(false);
  };

  return (
    <Stack gap={{ xs: 2, md: 2.5 }}>
      <PageHeader
        eyebrow="Terminal Configuration"
        title="System Settings"
        description="Configure global parameters, security protocols, and agentic autonomy."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" },
          gap: { xs: 2, lg: 3.5 },
          alignItems: "start",
        }}
      >
        <Stack component="nav" aria-label="Settings sections" gap={0.4} sx={{ pt: { lg: 0.75 } }}>
          {settingsSections.map(({ label, icon: Icon }) => {
            const active = activeSection === label;
            return (
              <Button
                key={label}
                fullWidth
                startIcon={<Icon sx={{ fontSize: 17 }} />}
                onClick={() => setActiveSection(label)}
                sx={{
                  minHeight: 40,
                  justifyContent: "flex-start",
                  px: 1.75,
                  color: active ? "primary.contrastText" : "text.secondary",
                  bgcolor: active ? "chrome.sidebar" : "transparent",
                  borderRadius: 1.5,
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "& .MuiButton-startIcon": { color: active ? "primary.light" : "text.secondary" },
                  "&:hover": { bgcolor: active ? "chrome.sidebar" : "action.hover" },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>

        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
            {activeSection === "Screen Architect" ? (
              <ScreenArchitect
                activeModule={activeModule}
                activeScreen={activeScreen}
                fields={fields}
                onModuleChange={selectModule}
                onScreenChange={setActiveScreen}
                onFieldToggle={toggleField}
                onReorder={reorderFields}
                onSave={commitOrder}
                onRevert={revertOrder}
                onAddCustomField={() => setCustomFieldDialogOpen(true)}
              />
            ) : (
              <Stack alignItems="flex-start" gap={1} sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {activeSection}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This settings area is reserved for a future configuration screen.
                </Typography>
                <Button variant="outlined" onClick={() => setActiveSection("Screen Architect")}>
                  Open Screen Architect
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
      <Dialog open={customFieldDialogOpen} onClose={() => setCustomFieldDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add custom field to Lead Management</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Screen / Form"
              value={customFieldDraft.screen}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, screen: event.target.value }))}
              fullWidth
            >
              {(screensByModule["CRM & Customer Engagement"] ?? []).map((screen) => <MenuItem key={screen} value={screen}>{screen}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Section"
              value={customFieldDraft.section}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, section: event.target.value as LeadCustomField["section"] }))}
              fullWidth
            >
              {(["Primary Information", "Classification", "Additional Information", "Follow-ups"] as const).map((section) => <MenuItem key={section} value={section}>{section}</MenuItem>)}
            </TextField>
            <TextField
              autoFocus
              label="Field label"
              value={customFieldDraft.label}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, label: event.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Data type"
              value={customFieldDraft.type}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, type: event.target.value as LeadCustomField["type"] }))}
              fullWidth
            >
              {(["Text / Char", "Number", "Date", "Long Text"] as const).map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Required field</Typography>
              <Switch checked={customFieldDraft.required} onChange={(event) => setCustomFieldDraft((current) => ({ ...current, required: event.target.checked }))} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomFieldDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addCustomField} disabled={!customFieldDraft.label.trim()}>Add field</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

const ScreenArchitect = ({
  activeModule,
  activeScreen,
  fields,
  onModuleChange,
  onScreenChange,
  onFieldToggle,
  onReorder,
  onSave,
  onRevert,
  onAddCustomField,
}: {
  activeModule: string;
  activeScreen: string;
  fields: ArchitectSection[];
  onModuleChange: (value: string) => void;
  onScreenChange: (value: string) => void;
  onFieldToggle: (id: string) => void;
  onReorder: (sectionTitle: string, sourceId: string, targetId: string) => void;
  onSave: () => void;
  onRevert: () => void;
  onAddCustomField: () => void;
}) => {
  const [draggedField, setDraggedField] = useState<string | null>(null);

  return (
  <Stack gap={{ xs: 2, md: 2.5 }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.15rem", md: "1.35rem" }, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.045em", lineHeight: 1.2 }}>
          Screen Architect
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.66rem", letterSpacing: "0.04em" }}>
          Select module
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddCustomField} sx={{ alignSelf: { sm: "center" }, minHeight: 34, px: 1.5, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.04em" }}>
        Add custom field
      </Button>
    </Stack>

    <ChipGroup items={modules} active={activeModule} onChange={onModuleChange} />

    <Divider />

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Select screen
      </Typography>
      <ChipGroup
        items={screensByModule[activeModule] ?? fallbackScreens}
        active={activeScreen}
        onChange={onScreenChange}
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        sx={{ mt: 1, minHeight: 30, px: 1.25, color: "success.main", borderColor: "success.main", fontSize: "0.62rem", letterSpacing: "0.035em" }}
      >
        Add screen to {activeModule}
      </Button>
    </Box>

    {activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management" ? (
      <Stack gap={{ xs: 1.5, md: 2 }}>
        {fields.map((section) => (
          <Accordion key={section.title} defaultExpanded disableGutters sx={{ border: 1, borderColor: "divider", borderRadius: "8px !important", boxShadow: "none", backgroundImage: "none", "&:before": { display: "none" }, "&.Mui-expanded": { margin: 0 } }}>
            <AccordionSummary sx={{ px: { xs: 1.25, md: 1.75 }, py: 0.5, minHeight: 52, "&.Mui-expanded": { minHeight: 52 }, "& .MuiAccordionSummary-content": { my: 0.75 }, "& .MuiAccordionSummary-content.Mui-expanded": { my: 0.75 } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em", lineHeight: 1.25, textTransform: "uppercase" }}>{section.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.64rem", lineHeight: 1.3 }}>{section.description}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1, md: 1.5 }, pt: 0.5, pb: { xs: 1, md: 1.25 }, borderTop: 1, borderColor: "divider" }}>
              <Stack gap={0.75}>
                {section.fields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    draggable={!field.required}
                    disabled={field.required}
                    onToggle={() => onFieldToggle(field.id)}
                    onDragStart={() => setDraggedField(field.required ? null : field.id)}
                    onDragEnd={() => setDraggedField(null)}
                    onDrop={() => {
                      if (draggedField) {
                        onReorder(section.title, draggedField, field.id);
                      }
                      setDraggedField(null);
                    }}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    ) : (
      <Stack gap={1} sx={{ py: 2 }}>
        <Typography variant="h6" sx={{ textTransform: "uppercase" }}>{activeScreen}</Typography>
        <Typography variant="body2" color="text.secondary">
          This screen is linked to the selected module and is reserved for configuration.
        </Typography>
        {dummyFields.map((section) => section.fields.map((field) => (
          <FieldRow key={field.id} field={field} onToggle={() => onFieldToggle(field.id)} />
        )))}
      </Stack>
    )}

    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={1.25}
      sx={{ pt: 1 }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 460, fontSize: "0.62rem", lineHeight: 1.4 }}>
        <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
          Intelligent persistence:
        </Box>{" "}
        Changes are staged in the neural cache. Update to propagate to all cloud instances.
      </Typography>
      <Stack direction="row" gap={0.75} sx={{ width: { xs: "100%", sm: "auto" } }}>
        <Button variant="outlined" onClick={onRevert} sx={{ minHeight: 32, px: 1.25, fontSize: "0.64rem", fontWeight: 700 }}>Revert</Button>
        <Button variant="contained" onClick={onSave} sx={{ minHeight: 32, px: 1.5, fontSize: "0.64rem", fontWeight: 700 }}>Update architecture</Button>
      </Stack>
    </Stack>
  </Stack>
  );
};

const ChipGroup = ({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) => (
  <Stack direction="row" flexWrap="wrap" gap={0.5}>
    {items.map((item) => (
      <Chip
        key={item}
        label={item}
        clickable
        onClick={() => onChange(item)}
        color={item === active ? "primary" : "default"}
        variant={item === active ? "filled" : "outlined"}
        sx={{ height: 28, fontSize: "0.6rem", fontWeight: 650, letterSpacing: "0.02em", maxWidth: "100%", borderRadius: 1.25, "& .MuiChip-label": { px: 1.1 } }}
      />
    ))}
  </Stack>
);

const FieldRow = ({
  field,
  onToggle,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  field: ArchitectField;
  onToggle: () => void;
  draggable?: boolean;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
}) => (
  <Box
    draggable={draggable}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragOver={(event) => event.preventDefault()}
    onDrop={onDrop}
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr auto",
        md: "28px minmax(0, 1.45fr) 96px 92px minmax(64px, 1fr)",
      },
      flexWrap: { xs: "wrap", md: "nowrap" },
      gap: { xs: 0.75, md: 1.25 },
      alignItems: "center",
      p: { xs: 0.75, md: 0.85 },
      bgcolor: "action.hover",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      cursor: draggable ? "grab" : "default",
      transition: (theme) =>
        theme.transitions.create(["background-color", "box-shadow", "transform"], {
          duration: theme.transitions.duration.short,
        }),
      "&:hover": {
        bgcolor: "background.paper",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
        transform: "translateY(-1px)",
      },
      "&:active": { cursor: draggable ? "grabbing" : "default" },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "background-color 150ms ease, box-shadow 150ms ease",
        "&:hover": { transform: "none" },
      },
    }}
  >
    <Box sx={{ display: { xs: "none", md: "grid" }, placeItems: "center", width: 26, height: 26, borderRadius: 1, bgcolor: "primary.light", color: "primary.contrastText" }}>
      {draggable ? <DragIndicatorIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.52rem", lineHeight: 1.1, letterSpacing: "0.04em" }}>Label</Typography>
      <Typography variant="body2" sx={{ fontSize: "0.65rem", fontWeight: 750, lineHeight: 1.15, overflowWrap: "anywhere", textTransform: "uppercase" }}>{field.label}</Typography>
    </Box>
    <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.52rem", lineHeight: 1.1, letterSpacing: "0.04em" }}>Data type</Typography>
      <Chip label={field.type} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.52rem", borderRadius: 1, "& .MuiChip-label": { px: 0.65 } }} />
    </Box>
    <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.52rem", lineHeight: 1.1, letterSpacing: "0.04em" }}>Rules</Typography>
      <Typography variant="caption" sx={{ display: "block", color: field.required ? "primary.main" : "text.secondary", fontSize: "0.56rem", fontWeight: 750, lineHeight: 1.2, textTransform: "uppercase" }}>
        {field.required ? "Required" : "Optional"}
      </Typography>
    </Box>
    <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={0.5} sx={{ minWidth: 0, display: { xs: "flex", md: "contents" } }}>
      <Button
        size="small"
        variant={field.visible ? "contained" : "outlined"}
        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: "0.85rem !important" }} />}
        aria-label={`${field.visible ? "Hide" : "Show"} ${field.label}`}
        onClick={onToggle}
        sx={{
          minWidth: { xs: 30, md: 82 },
          minHeight: 26,
          px: { xs: 0.5, md: 1 },
          fontSize: "0.5rem",
          fontWeight: 800,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          "& .MuiButton-startIcon": { mr: { xs: 0, md: 0.5 } },
          "& .MuiButton-startIcon + *": { display: { xs: "none", md: "inline" } },
        }}
      >
        {field.visible ? "Hide field" : "Show field"}
      </Button>
    </Stack>
  </Box>
);
