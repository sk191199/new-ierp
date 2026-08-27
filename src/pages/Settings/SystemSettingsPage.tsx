import AddIcon from "@mui/icons-material/Add";
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
import { readSectionsByScreen, readSettingsCatalog, saveSectionsByScreen, saveSettingsCatalog, settingsScreenKey, type SettingsCatalog } from "./settingsCatalog";

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
    const order = section.title === "Primary Information"
      ? savedOrder.primary
      : section.title === "Classification"
        ? savedOrder.classification
        : section.title === "Additional Information"
          ? savedOrder.additionalInformation
          : section.title === "Follow-ups"
            ? savedOrder.followUps
            : [];
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

const buildFieldsForScreen = (
  module: string,
  screen: string,
  sectionsByScreen: Record<string, string[]>,
  customFields: LeadCustomField[],
): ArchitectSection[] => {
  if (module === "CRM & Customer Engagement" && screen === "Lead Management") {
    return applySavedOrder(initialFields);
  }

  const storedSections = sectionsByScreen[settingsScreenKey(module, screen)] ?? sectionsByScreen[screen] ?? [];
  const screenFields = customFields.filter((field) => field.module === module && field.screen === screen);
  const visibility = readLeadFieldVisibility();
  const sectionNames = Array.from(new Set([...storedSections, ...screenFields.map((field) => field.section)]));

  return sectionNames.map((title) => ({
    title,
    description: "Configured screen fields.",
    fields: screenFields.filter((field) => field.section === title).map((field) => ({ ...field, visible: visibility[field.id] ?? true })),
  }));
};

export const SystemSettingsPage = () => {
  const [activeSection, setActiveSection] = useState("Screen Architect");
  const [activeModule, setActiveModule] = useState("CRM & Customer Engagement");
  const [activeScreen, setActiveScreen] = useState("Lead Management");
  const [catalog, setCatalog] = useState<SettingsCatalog>(() => readSettingsCatalog());
  const [fields, setFields] = useState(() => buildFieldsForScreen(activeModule, activeScreen, readSectionsByScreen(), readLeadCustomFields()));
  const [customFields, setCustomFields] = useState<LeadCustomField[]>(readLeadCustomFields);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [customFieldError, setCustomFieldError] = useState("");
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
    const screens = screensByModule[module] ?? [];
    setActiveModule(module);
    setActiveScreen(screens[0] ?? "");
    setFields(buildFieldsForScreen(module, screens[0] ?? "", sectionsByScreen, customFields));
  };

  const selectScreen = (screen: string) => {
    setActiveScreen(screen);
    setFields(buildFieldsForScreen(activeModule, screen, sectionsByScreen, customFields));
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
    setFields(buildFieldsForScreen(activeModule, name, sectionsByScreen, customFields));
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
    if (activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management") {
      saveLeadFieldOrder({
        primary: fields.find((section) => section.title === "Primary Information")?.fields.map((field) => field.id) ?? [],
        classification: fields.find((section) => section.title === "Classification")?.fields.map((field) => field.id) ?? [],
        additionalInformation: fields.find((section) => section.title === "Additional Information")?.fields.map((field) => field.id) ?? [],
        followUps: fields.find((section) => section.title === "Follow-ups")?.fields.map((field) => field.id) ?? [],
      });
      saveLeadFieldVisibility({ ...readLeadFieldVisibility(), ...Object.fromEntries(fields.flatMap((section) => section.fields.map((field) => [field.id, field.visible]))) });
    } else {
      const activeFieldIds = new Set(fields.flatMap((section) => section.fields.map((field) => field.id)));
      const orderedActiveFields = fields.flatMap((section) => section.fields.map((field) => field.id));
      const activeCustomFields = customFields.filter((field) => activeFieldIds.has(field.id));
      let activeIndex = 0;
      const nextCustomFields = customFields.map((field) => {
        if (!activeFieldIds.has(field.id)) {
          return field;
        }
        const nextId = orderedActiveFields[activeIndex++];
        return activeCustomFields.find((customField) => customField.id === nextId) ?? field;
      });
      saveLeadFieldVisibility({ ...readLeadFieldVisibility(), ...Object.fromEntries(fields.flatMap((section) => section.fields.map((field) => [field.id, field.visible]))) });
      saveLeadCustomFields(nextCustomFields);
    }
    if (activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management") {
      saveLeadCustomFields(customFields);
    }
    dispatch(toastShown({ message: activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management" ? "Lead Management architecture updated successfully." : "Architecture updated successfully.", severity: "success" }));
  };

  const revertOrder = () => setFields(buildFieldsForScreen(activeModule, activeScreen, readSectionsByScreen(), readLeadCustomFields()));

  const addCustomField = () => {
    const availableScreens = screensByModule[customFieldDraft.module] ?? [];
    if (!modules.includes(customFieldDraft.module) || !availableScreens.length) {
      setCustomFieldError("No screens are configured for this module. Please add a screen before creating a custom field.");
      dispatch(toastShown({ message: "No screens are configured for this module. Please add a screen before creating a custom field.", severity: "error" }));
      return;
    }

    if (!customFieldDraft.screen.trim() || !availableScreens.includes(customFieldDraft.screen)) {
      setCustomFieldError("Please select a screen before creating a custom field.");
      dispatch(toastShown({ message: "Please select a screen before creating a custom field.", severity: "error" }));
      return;
    }

    const label = customFieldDraft.label.trim();
    if (!label) {
      return;
    }
    const section = customFieldDraft.section === "__new__" ? newSectionName.trim() : customFieldDraft.section;
    if (!section) return;
    const sectionKey = settingsScreenKey(customFieldDraft.module, customFieldDraft.screen);
    const existingSections = sectionsByScreen[sectionKey] ?? sectionsByScreen[customFieldDraft.screen] ?? [];
    const nextSections = { ...sectionsByScreen, [sectionKey]: [...existingSections, ...(existingSections.includes(section) ? [] : [section])] };
    setSectionsByScreen(nextSections);
    saveSectionsByScreen(nextSections);
    const field = { ...customFieldDraft, section, id: `custom_${Date.now()}`, label };
    const nextCustomFields = [...customFields, field];
    setCustomFields(nextCustomFields);
    saveLeadCustomFields(nextCustomFields);
    if (field.module === activeModule && field.screen === activeScreen) {
      setFields(buildFieldsForScreen(activeModule, activeScreen, nextSections, nextCustomFields));
    }
    setCustomFieldDraft({ label: "", type: "Text / Char", required: false, module: "CRM & Customer Engagement", screen: "Lead Management", section: "Additional Information" });
    setNewSectionName("");
    setCustomFieldError("");
    setCustomFieldDialogOpen(false);
    dispatch(toastShown({ message: "Custom field added successfully.", severity: "success" }));
  };

  return (
    <Stack gap={{ xs: 2, md: 2.75 }} sx={{ minWidth: 0 }}>
      <PageHeader
        eyebrow="Terminal Configuration"
        title="System Settings"
        description="Configure your ERP environment, screen architecture, workflows, security, and intelligent behaviour."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "232px minmax(0, 1fr)" },
          gap: { xs: 2, md: 2.5, lg: 3 },
          alignItems: "start",
        }}
      >
        <Stack
          component="nav"
          aria-label="Settings sections"
          gap={0.5}
          sx={{
            pt: { lg: 0.75 },
            position: { lg: "sticky" },
            top: { lg: 24 },
            overflowX: { xs: "auto", lg: "visible" },
            flexDirection: { xs: "row", lg: "column" },
            pb: { xs: 0.5, lg: 0 },
            scrollbarWidth: "thin",
          }}
        >
          {settingsSections.map(({ label, icon: Icon }) => {
            const active = activeSection === label;
            return (
              <Button
                key={label}
                fullWidth
                startIcon={<Icon sx={{ fontSize: 17 }} />}
                onClick={() => setActiveSection(label)}
                sx={{
                  minHeight: 42,
                  flex: { xs: "0 0 auto", lg: "initial" },
                  justifyContent: "flex-start",
                  px: 1.5,
                  border: 1,
                  borderColor: "transparent",
                  color: active ? "primary.contrastText" : "text.secondary",
                  bgcolor: active ? "primary.main" : "transparent",
                  borderRadius: 1.5,
                  fontSize: "0.72rem",
                  fontWeight: active ? 800 : 650,
                  letterSpacing: "0.04em",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "& .MuiButton-startIcon": {
                    color: active ? "primary.contrastText" : "text.secondary",
                    mr: 1,
                  },
                  "&:hover": {
                    bgcolor: active ? "primary.main" : "action.hover",
                    borderColor: active ? "transparent" : "divider",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>

        <Card sx={{ overflow: "hidden", minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.25, md: 3 }, "&:last-child": { pb: { xs: 1.5, sm: 2.25, md: 3 } } }}>
            {activeSection === "Screen Architect" ? (
              <ScreenArchitect
                activeModule={activeModule}
                activeScreen={activeScreen}
                fields={fields}
                onModuleChange={selectModule}
                onScreenChange={selectScreen}
                onFieldToggle={toggleField}
                onReorder={reorderFields}
                onSave={commitOrder}
                onRevert={revertOrder}
                onAddCustomField={() => {
                  const availableScreens = screensByModule[activeModule] ?? [];
                  if (!availableScreens.length) {
                    dispatch(toastShown({ message: "No screens are configured for this module. Please add a screen before creating a custom field.", severity: "error" }));
                    return;
                  }
                  setCustomFieldModule(activeModule);
                  const screen = availableScreens.includes(activeScreen) ? activeScreen : availableScreens[0];
                  setCustomFieldError("");
                  const availableSections = sectionsByScreen[settingsScreenKey(activeModule, screen)] ?? sectionsByScreen[screen] ?? [];
                  setCustomFieldDraft((current) => ({ ...current, module: activeModule, screen, section: availableSections[0] ?? "__new__" }));
                  setCustomFieldDialogOpen(true);
                }}
                onAddModule={() => setModuleDialogOpen(true)}
                onAddScreen={() => setScreenDialogOpen(true)}
                modules={modules}
                screensByModule={screensByModule}
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
      <Dialog
        open={customFieldDialogOpen}
        onClose={() => setCustomFieldDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { m: { xs: 1.5, sm: 2 }, width: { xs: "calc(100% - 24px)", sm: "100%" }, borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1 }}>Add custom field</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, maxHeight: { xs: "70vh", sm: "none" } }}>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Module"
              value={customFieldModule}
              onChange={(event) => {
                const module = event.target.value;
                const nextScreens = screensByModule[module] ?? [];
                setCustomFieldModule(module);
                if (!nextScreens.length) {
                  setCustomFieldError("No screens are configured for this module. Please add a screen before creating a custom field.");
                  setCustomFieldDraft((current) => ({ ...current, module, screen: "", section: "" }));
                  return;
                }

                const screen = nextScreens[0];
                setCustomFieldError("");
                const availableSections = sectionsByScreen[settingsScreenKey(module, screen)] ?? sectionsByScreen[screen] ?? [];
                setCustomFieldDraft((current) => ({ ...current, module, screen, section: availableSections[0] ?? "__new__" }));
              }}
              fullWidth
              error={Boolean(customFieldError)}
              helperText={customFieldError || undefined}
            >
              {modules.map((module) => <MenuItem key={module} value={module}>{module}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Screen / Form"
              value={customFieldDraft.screen}
              onChange={(event) => {
                const screen = event.target.value;
                setCustomFieldError("");
                const availableSections = sectionsByScreen[settingsScreenKey(customFieldDraft.module, screen)] ?? sectionsByScreen[screen] ?? [];
                setCustomFieldDraft((current) => ({ ...current, screen, section: availableSections[0] ?? "__new__" }));
              }}
              fullWidth
              error={Boolean(customFieldError)}
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
              {(sectionsByScreen[settingsScreenKey(customFieldDraft.module, customFieldDraft.screen)] ?? sectionsByScreen[customFieldDraft.screen] ?? []).map((section) => <MenuItem key={section} value={section}>{section}</MenuItem>)}
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
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1, "& .MuiButton-root": { minHeight: 40 } }}>
          <Button onClick={() => setCustomFieldDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={addCustomField}
            disabled={
              !modules.includes(customFieldDraft.module) ||
              !(screensByModule[customFieldDraft.module] ?? []).length ||
              !customFieldDraft.screen.trim() ||
              !customFieldDraft.label.trim() ||
              (!customFieldDraft.section.trim() || (customFieldDraft.section === "__new__" && !newSectionName.trim()))
            }
          >
            Add field
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={moduleDialogOpen}
        onClose={() => setModuleDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(15, 23, 42, 0.45)",
            },
          },
        }}
        PaperProps={{ sx: { m: { xs: 1.5, sm: 2 }, width: { xs: "calc(100% - 24px)", sm: "100%" }, borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 } }}>Add module</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <TextField autoFocus fullWidth label="Module name" value={moduleName} onChange={(event) => setModuleName(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addModule} disabled={!moduleName.trim()}>Add module</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={screenDialogOpen} onClose={() => setScreenDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { m: { xs: 1.5, sm: 2 }, width: { xs: "calc(100% - 24px)", sm: "100%" }, borderRadius: 2.5 } }}>
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, overflowWrap: "anywhere" }}>Add screen to {activeModule}</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <TextField autoFocus fullWidth label="Screen name" value={screenName} onChange={(event) => setScreenName(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
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
}) => {
  const [draggedField, setDraggedField] = useState<string | null>(null);

  return (
  <Stack gap={{ xs: 2, md: 2.75 }} sx={{ minWidth: 0 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "flex-start" }}
      gap={2}
      sx={{ pb: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 800 }}>
          Screen Architect
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
          Design and control the structure of your ERP screens.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddCustomField}
        sx={{ alignSelf: { sm: "flex-start" }, minHeight: 42, whiteSpace: "nowrap", boxShadow: "none" }}
      >
        Add custom field
      </Button>
    </Stack>

    <Box sx={{ p: { xs: 1.25, md: 1.5 }, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover", minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", fontWeight: 800, lineHeight: 1.5 }}>
        Module
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} gap={1.25} sx={{ mt: 0.75 }}>
        <ChipGroup items={modules} active={activeModule} onChange={onModuleChange} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddModule}
          sx={{
            alignSelf: { xs: "flex-start", md: "center" },
            ml: { md: "auto" },
            flexShrink: 0,
            color: "success.main",
            borderColor: "success.main",
            whiteSpace: "nowrap",
            "&:hover": { color: "success.dark", borderColor: "success.main", bgcolor: "background.paper" },
          }}
        >
          Add module
        </Button>
      </Stack>
    </Box>

    <Box sx={{ p: { xs: 1.25, md: 1.5 }, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover", minWidth: 0 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "flex-start" }} gap={1.25}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", fontWeight: 800, lineHeight: 1.5 }}>
            Screens
          </Typography>
          <Typography variant="caption" color="text.secondary">Choose a screen to configure its sections and fields.</Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddScreen}
          sx={{ alignSelf: { xs: "flex-start", md: "center" }, color: "success.main", borderColor: "success.main", whiteSpace: "nowrap", "&:hover": { color: "success.dark", borderColor: "success.main", bgcolor: "background.paper" } }}
        >
          Add screen
        </Button>
      </Stack>
      <Box sx={{ mt: 1 }}>
        <ChipGroup
          items={screensByModule[activeModule] ?? []}
          active={activeScreen}
          onChange={onScreenChange}
        />
      </Box>
    </Box>

    <Divider />

    <Stack direction="row" alignItems="center" gap={1}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main", flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary">
        {activeModule} <Box component="span" sx={{ color: "text.disabled", px: 0.5 }}>›</Box> {activeScreen}
      </Typography>
    </Stack>

    {activeModule === "CRM & Customer Engagement" && activeScreen === "Lead Management" ? (
      <Stack gap={2}>
        {fields.map((section, index) => (
          <Accordion key={section.title} defaultExpanded={false} disableGutters sx={{ border: 1, borderColor: "divider", borderRadius: "12px !important", boxShadow: "none", overflow: "hidden", transition: "background-color 160ms ease", "&:before": { display: "none" }, "&:hover": { borderColor: "divider" }, "&.Mui-expanded": { borderColor: "divider", bgcolor: "action.hover" }, "&:focus-visible": { outline: "none", borderColor: "divider" }, "& .MuiAccordionSummary-root:focus-visible": { outline: "none", borderColor: "divider" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: { xs: 1.5, md: 2 }, py: 0.5, minHeight: 72, "& .MuiAccordionSummary-content": { my: 1.25 } }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800 }}>0{index + 1}</Typography>
                  <Typography variant="h6" sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, fontWeight: 800 }}>{section.title}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">{section.description}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
                  {section.fields.length} fields <Box component="span" sx={{ px: 0.5 }}>·</Box> {section.fields.filter((field) => field.required).length} required <Box component="span" sx={{ px: 0.5 }}>·</Box> {section.fields.filter((field) => !field.required).length} optional
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1, md: 2 }, pb: { xs: 1.25, md: 2 }, pt: { xs: 0.5, md: 0.75 }, borderTop: 1, borderColor: "divider" }}>
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
        {fields.map((section) => (
          <Accordion key={section.title} defaultExpanded={false} disableGutters sx={{ border: 1, borderColor: "divider", borderRadius: "10px !important", boxShadow: "none", "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}><Typography variant="h6">{section.title}</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 1 }}>
              <Stack gap={1.25}>
                {section.fields.map((field) => (
                  <FieldRow key={field.id} field={field} onToggle={() => onFieldToggle(field.id)} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    )}

    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={2}
      sx={{ mt: 0.5, pt: 2, borderTop: 1, borderColor: "divider" }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 460, lineHeight: 1.5 }}>
        <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>Intelligent persistence</Box>{" "}
        Changes are staged until architecture is updated.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} gap={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
        <Button variant="outlined" onClick={onRevert} sx={{ minWidth: { sm: 92 } }}>Revert</Button>
        <Button variant="contained" onClick={onSave} sx={{ minWidth: { sm: 178 } }}>Update architecture</Button>
      </Stack>
    </Stack>
  </Stack>
  );
};

const ChipGroup = ({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) => (
  <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ flex: 1, minWidth: 0 }}>
    {items.map((item) => (
      <Chip
        key={item}
        label={item}
        clickable
        onClick={() => onChange(item)}
        color={item === active ? "primary" : "default"}
        variant={item === active ? "filled" : "outlined"}
        sx={{ fontSize: "0.68rem", maxWidth: { xs: 260, md: "100%" }, flexShrink: 0, height: 30, borderRadius: 1.25, fontWeight: item === active ? 800 : 650, transition: "background-color 160ms ease, border-color 160ms ease" }}
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
        xs: "40px minmax(0, 1fr)",
        sm: "42px minmax(120px, 1.3fr) minmax(92px, 0.85fr) minmax(88px, 0.85fr) minmax(96px, 0.8fr)",
        md: "36px minmax(0, 1fr) minmax(82px, 0.85fr) minmax(76px, 0.85fr) minmax(78px, 0.8fr)",
        xl: "42px minmax(220px, 1.45fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(180px, 0.9fr)",
      },
      gap: { xs: 1.25, md: 1.25, xl: 2 },
      alignItems: "center",
      p: { xs: 1.5, sm: 1.5 },
      bgcolor: "background.paper",
      border: 1,
      borderColor: "divider",
      borderRadius: 1.5,
      transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
      "&:hover": { borderColor: draggable ? "primary.main" : "divider", bgcolor: "action.hover" },
      "& > *": { minWidth: 0 },
      "& > :nth-of-type(3)": { display: { xs: "block", sm: "flex" }, gridColumn: { xs: "1 / -1", sm: "auto" }, mt: { xs: 0.5, sm: 0 } },
      "& > :nth-of-type(4)": { gridColumn: { xs: "1 / -1", sm: "auto" } },
      "& > :nth-of-type(5)": { gridColumn: { xs: "1 / -1", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-end" }, borderTop: { xs: 1, sm: 0 }, borderColor: "divider", pt: { xs: 1, sm: 0 }, mt: { xs: 0.25, sm: 0 } },
      cursor: draggable ? "grab" : "default",
      "&:active": { cursor: draggable ? "grabbing" : "default" },
    }}
  >
    <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 1.25, bgcolor: draggable ? "action.selected" : "action.hover", color: draggable ? "primary.main" : "text.disabled" }}>
      {draggable ? <DragIndicatorIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em" }}>
        Field
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{field.label}</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: { xs: "block", sm: "none" }, mt: 0.25, overflowWrap: "anywhere" }}>{field.id}</Typography>
    </Box>
    <Stack direction="row" alignItems="center" gap={1} sx={{ display: { xs: "none", sm: "flex" }, minWidth: 0 }}>
      <Stack gap={0.35} minWidth={0}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em" }}>
          Data type
        </Typography>
        <Chip label={field.type} size="small" variant="outlined" />
      </Stack>
    </Stack>
    <Box sx={{ display: "block", minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em" }}>
        Rule
      </Typography>
      <Typography variant="body2" sx={{ color: field.required ? "primary.main" : "text.secondary", fontWeight: 800 }}>
        {field.required ? "Required" : "Optional"}
      </Typography>
    </Box>
    <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={{ xs: 1, md: 0.25, xl: 1 }} sx={{ minWidth: 0 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em" }}>
          Action
        </Typography>
      </Box>
      <Tooltip title={field.visible ? "Hide field" : "Show field"}>
        <IconButton size="small" aria-label={`${field.visible ? "Hide" : "Show"} ${field.label}`} onClick={onToggle} color={field.visible ? "primary" : "default"} sx={{ flexShrink: 0, p: { md: 0.5, xl: 1 } }}>
          {field.visible ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Stack>
  </Box>
);
