import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
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
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import {
  readLeadCustomFields,
  readLeadFieldOrder,
  readLeadFieldVisibility,
  saveLeadCustomFields,
  saveLeadFieldOrder,
  saveLeadFieldVisibility,
  type LeadCustomField,
} from "@/pages/CRM/Leads/leadFieldOrder";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { readSectionsByScreen, readSettingsCatalog, saveSectionsByScreen, saveSettingsCatalog, type SettingsCatalog } from "./settingsCatalog";

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

const initialFields = [
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
].map((section) => ({
  ...section,
  fields: section.fields.map((field) => {
    const [label, id, type, required] = field as [string, string, string, boolean];
    return { label, id, type, required, visible: true };
  }),
})) satisfies ArchitectSection[];

const applySavedOrder = (sections: ArchitectSection[]): ArchitectSection[] => {
  const savedOrder = readLeadFieldOrder();
  const savedCustomFields = readLeadCustomFields();
  const visibility = readLeadFieldVisibility();
  const mappedSections = sections.map((section) => {
    const sectionCustomFields = savedCustomFields
      .filter((field) => field.module === "CRM & Customer Engagement" && field.screen === "Lead Management" && field.section === section.title)
      .map((field) => ({ ...field, visible: true }));
    const sectionFields = [...section.fields, ...sectionCustomFields].map((field) => ({
      ...field,
      visible: visibility[field.id] ?? field.visible,
    }));
    const order = section.title === "Primary Information" ? savedOrder.primary : section.title === "Follow-ups" ? savedOrder.followUps : [];
    if (!order.length) {
      return { ...section, fields: sectionFields };
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
          return field;
        }
        return optionalFields[optionalIndex++] ?? field;
      }),
    };
  });
  const customSections = Array.from(new Set(savedCustomFields.filter((field) => field.module === "CRM & Customer Engagement" && field.screen === "Lead Management").map((field) => field.section)))
    .filter((title) => !mappedSections.some((section) => section.title === title))
    .map((title) => ({
      title,
      description: "Custom Lead Management fields.",
      fields: savedCustomFields.filter((field) => field.module === "CRM & Customer Engagement" && field.screen === "Lead Management" && field.section === title).map((field) => ({ ...field, visible: visibility[field.id] ?? true })),
    }));
  return [...mappedSections, ...customSections];
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
  const [catalog, setCatalog] = useState<SettingsCatalog>(() => readSettingsCatalog());
  const [fields, setFields] = useState(() => applySavedOrder(initialFields));
  const [customFields, setCustomFields] = useState<LeadCustomField[]>(readLeadCustomFields);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [sectionsByScreen, setSectionsByScreen] = useState(readSectionsByScreen);
  const [customFieldDraft, setCustomFieldDraft] = useState({ label: "", type: "Text / Char" as LeadCustomField["type"], required: false, module: "CRM & Customer Engagement", screen: "Lead Management", section: "Additional Information" });
  const [newSectionName, setNewSectionName] = useState("");
  const [customFieldModule, setCustomFieldModule] = useState(activeModule);
  const dispatch = useAppDispatch();
  const modules = catalog.modules;
  const screensByModule = catalog.screensByModule;

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

  const addModule = () => {
    const name = moduleName.trim();
    if (!name || catalog.modules.includes(name)) return;
    const next = { ...catalog, modules: [...catalog.modules, name], screensByModule: { ...catalog.screensByModule, [name]: [] } };
    setCatalog(next);
    saveSettingsCatalog(next);
    setModuleName("");
    setModuleDialogOpen(false);
    dispatch(toastShown({ message: "Module added successfully.", severity: "success" }));
  };

  const addScreen = () => {
    const name = screenName.trim();
    if (!name || (screensByModule[activeModule] ?? []).includes(name)) return;
    const next = { ...catalog, screensByModule: { ...screensByModule, [activeModule]: [...(screensByModule[activeModule] ?? []), name] } };
    setCatalog(next);
    saveSettingsCatalog(next);
    setActiveScreen(name);
    setScreenName("");
    setScreenDialogOpen(false);
    dispatch(toastShown({ message: "Screen added successfully.", severity: "success" }));
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
    const section = customFieldDraft.section === "__new__" ? newSectionName.trim() : customFieldDraft.section;
    if (!section) return;
    const nextSections = { ...sectionsByScreen, [customFieldDraft.screen]: [...(sectionsByScreen[customFieldDraft.screen] ?? []), ...(sectionsByScreen[customFieldDraft.screen]?.includes(section) ? [] : [section])] };
    setSectionsByScreen(nextSections);
    saveSectionsByScreen(nextSections);
    const field = { ...customFieldDraft, section, id: `custom_${Date.now()}`, label };
    const nextCustomFields = [...customFields, field];
    setCustomFields(nextCustomFields);
    saveLeadCustomFields(nextCustomFields);
    if (field.screen === "Lead Management") {
      setFields((current) => {
        const exists = current.some((section) => section.title === field.section);
        return exists
          ? current.map((section) => section.title === field.section ? { ...section, fields: [...section.fields, { ...field, visible: true }] } : section)
          : [...current, { title: field.section, description: "Custom Lead Management fields.", fields: [{ ...field, visible: true }] }];
      });
    }
    setCustomFieldDraft({ label: "", type: "Text / Char", required: false, module: "CRM & Customer Engagement", screen: "Lead Management", section: "Additional Information" });
    setNewSectionName("");
    setCustomFieldDialogOpen(false);
    dispatch(toastShown({ message: "Custom field added successfully.", severity: "success" }));
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
                onAddCustomField={() => {
                  const availableScreens = screensByModule[activeModule] ?? [];
                  if (!availableScreens.length) {
                    dispatch(toastShown({ message: "No screens are available for this module.", severity: "info" }));
                    return;
                  }
                  setCustomFieldModule(activeModule);
                  setCustomFieldDraft((current) => ({ ...current, module: activeModule, screen: activeScreen, section: (sectionsByScreen[activeScreen] ?? ["Additional Information"])[0] }));
                  setCustomFieldDialogOpen(true);
                }}
                onAddModule={() => setModuleDialogOpen(true)}
                onAddScreen={() => setScreenDialogOpen(true)}
                modules={modules}
                screensByModule={screensByModule}
                customFields={customFields}
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
        <DialogTitle>Add custom field</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Module"
              value={customFieldModule}
              onChange={(event) => {
                const module = event.target.value;
                const nextScreens = screensByModule[module] ?? [];
                setCustomFieldModule(module);
                setCustomFieldDraft((current) => ({ ...current, module, screen: nextScreens[0] ?? "", section: "" }));
              }}
              fullWidth
            >
              {modules.map((module) => <MenuItem key={module} value={module}>{module}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Screen / Form"
              value={customFieldDraft.screen}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, screen: event.target.value, section: (sectionsByScreen[event.target.value] ?? ["Additional Information"])[0] }))}
              fullWidth
            >
              {(screensByModule[customFieldModule] ?? []).map((screen) => <MenuItem key={screen} value={screen}>{screen}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Section"
              value={customFieldDraft.section}
              onChange={(event) => setCustomFieldDraft((current) => ({ ...current, section: event.target.value }))}
              fullWidth
            >
              {(sectionsByScreen[customFieldDraft.screen] ?? []).map((section) => <MenuItem key={section} value={section}>{section}</MenuItem>)}
              <MenuItem value="__new__">Add new section</MenuItem>
            </TextField>
            {customFieldDraft.section === "__new__" ? (
              <TextField label="New section name" value={newSectionName} onChange={(event) => setNewSectionName(event.target.value)} fullWidth />
            ) : null}
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
      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add module</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Module name" value={moduleName} onChange={(event) => setModuleName(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addModule} disabled={!moduleName.trim()}>Add module</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={screenDialogOpen} onClose={() => setScreenDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add screen to {activeModule}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Screen name" value={screenName} onChange={(event) => setScreenName(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScreenDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addScreen} disabled={!screenName.trim()}>Add screen</Button>
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
  onAddModule,
  onAddScreen,
  modules,
  screensByModule,
  customFields,
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
  onAddModule: () => void;
  onAddScreen: () => void;
  modules: string[];
  screensByModule: Record<string, string[]>;
  customFields: LeadCustomField[];
}) => {
  const [draggedField, setDraggedField] = useState<string | null>(null);

  return (
  <Stack gap={2.5}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
      <Box>
        <Typography variant="h4" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Screen Architect
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Select module
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddCustomField} sx={{ alignSelf: { sm: "flex-start" } }}>
        Add custom field
      </Button>
    </Stack>

    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
      <ChipGroup items={modules} active={activeModule} onChange={onModuleChange} />
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAddModule}
        sx={{ color: "success.main", borderColor: "success.main", "&:hover": { color: "success.dark", borderColor: "success.main", bgcolor: "action.hover" } }}
      >
        Add module
      </Button>
    </Stack>

    <Divider />

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
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
        onClick={onAddScreen}
        sx={{ mt: 1.5, color: "success.main", borderColor: "success.main" }}
      >
        Add screen to {activeModule}
      </Button>
    </Box>

    {activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management" ? (
      <Stack gap={2}>
        {fields.map((section) => (
          <Accordion key={section.title} defaultExpanded={false} disableGutters sx={{ border: 1, borderColor: "divider", borderRadius: "10px !important", boxShadow: "none", "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, minHeight: 62 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ textTransform: "uppercase" }}>{section.title}</Typography>
                <Typography variant="caption" color="text.secondary">{section.description}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1, md: 2 }, pb: 2 }}>
              <Stack gap={1.25}>
                {section.fields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    draggable={!field.required}
                    onToggle={() => {
                      if (!field.required) {
                        onFieldToggle(field.id);
                      }
                    }}
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
      <Stack gap={2} sx={{ py: 2 }}>
        <Typography variant="h6" sx={{ textTransform: "uppercase" }}>{activeScreen}</Typography>
        <Typography variant="body2" color="text.secondary">
          This screen is linked to the selected module and is reserved for configuration.
        </Typography>
        {Array.from(new Set(customFields.filter((field) => field.module === activeModule && field.screen === activeScreen).map((field) => field.section))).map((section) => (
          <Accordion key={section} defaultExpanded={false} disableGutters sx={{ border: 1, borderColor: "divider", borderRadius: "10px !important", boxShadow: "none", "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}><Typography variant="h6">{section}</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 1 }}>
              <Stack gap={1.25}>
                {customFields.filter((field) => field.module === activeModule && field.screen === activeScreen && field.section === section).map((field) => (
                  <FieldRow key={field.id} field={{ ...field, visible: true }} onToggle={() => {}} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
        {customFields.every((field) => field.module !== activeModule || field.screen !== activeScreen) ? dummyFields.map((section) => section.fields.map((field) => (
          <FieldRow key={field.id} field={field} onToggle={() => onFieldToggle(field.id)} />
        ))) : null}
      </Stack>
    )}

    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={2}
      sx={{ pt: 1.5 }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 410 }}>
        <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
          Intelligent persistence:
        </Box>{" "}
        Changes are staged in the neural cache. Update to propagate to all cloud instances.
      </Typography>
      <Stack direction="row" gap={1}>
        <Button variant="outlined" onClick={onRevert}>Revert</Button>
        <Button variant="contained" onClick={onSave}>Update architecture</Button>
      </Stack>
    </Stack>
  </Stack>
  );
};

const ChipGroup = ({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) => (
  <Stack direction="row" flexWrap="wrap" gap={0.75}>
    {items.map((item) => (
      <Chip
        key={item}
        label={item}
        clickable
        onClick={() => onChange(item)}
        color={item === active ? "primary" : "default"}
        variant={item === active ? "filled" : "outlined"}
        sx={{ fontSize: "0.62rem", maxWidth: "100%" }}
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
        md: "42px minmax(220px, 1.45fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(180px, 0.9fr)",
      },
      gap: { xs: 1, md: 2 },
      alignItems: "center",
      p: { xs: 1.25, md: 1.5 },
      bgcolor: "action.hover",
      borderRadius: 1.5,
      "& > *": { minWidth: 0 },
      cursor: draggable ? "grab" : "default",
      "&:active": { cursor: draggable ? "grabbing" : "default" },
    }}
  >
    <Box sx={{ display: { xs: "none", md: "grid" }, placeItems: "center", width: 34, height: 34, borderRadius: 1.25, bgcolor: "primary.light", color: "primary.contrastText" }}>
      {draggable ? <DragIndicatorIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">Label</Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, textTransform: "uppercase" }}>{field.label}</Typography>
    </Box>
    <Stack direction="row" alignItems="center" gap={1} sx={{ display: { xs: "none", md: "flex" }, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">Data type</Typography>
      <Chip label={field.type} size="small" variant="outlined" />
    </Stack>
    <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">Rules architect</Typography>
      <Typography variant="caption" sx={{ display: "block", color: field.required ? "primary.main" : "text.secondary", fontWeight: 800, textTransform: "uppercase" }}>
        {field.required ? "Required" : "Optional"}
      </Typography>
    </Box>
    <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>{field.id}</Typography>
      <Tooltip title={field.visible ? "Hide field" : "Show field"}>
        <IconButton size="small" aria-label={`${field.visible ? "Hide" : "Show"} ${field.label}`} onClick={onToggle} color={field.visible ? "primary" : "default"}>
          {field.visible ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Stack>
  </Box>
);
