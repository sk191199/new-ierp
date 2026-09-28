import { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { getAllModules, getDynamicModuleEntity } from "@/configurations/api/settingsService";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { readLeadCustomFields, type LeadCustomField } from "@/pages/CRM/Leads/leadFieldOrder";
import type { MetadataField } from "@/models/metadata/metadata";
import { readSectionsByScreen, settingsScreenKey, settingsSlug } from "./settingsCatalog";

export const ConfiguredScreenPage = () => {
  const { module: moduleSlug, screen: screenSlug } = useParams();
  const [moduleName, setModuleName] = useState("Configured Module");
  const [screenName, setScreenName] = useState("Configured Screen");
  const [dynamicScreen, setDynamicScreen] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<MetadataField[]>([]);

  useEffect(() => {
    let active = true;
    const loadScreen = async () => {
      try {
        const modules = await getAllModules();
        const module = modules.find((item) => settingsSlug(item.name) === moduleSlug);
        const screen = module?.screens.find((item) => settingsSlug(item.name) === screenSlug);
        if (!active) {
          return;
        }
        setModuleName(module?.name ?? "Configured Module");
        setScreenName(screen?.name ?? "Configured Screen");
        setDynamicScreen(screen?.source === "dynamic");
        setDynamicFields([]);

        if (screen?.source === "dynamic") {
          const entity = await getDynamicModuleEntity(screen.id);
          if (active) {
            setDynamicFields(entity.fields);
          }
        }
      } catch {
        if (active) {
          setDynamicFields([]);
        }
      }
    };
    void loadScreen();

    return () => {
      active = false;
    };
  }, [moduleSlug, screenSlug]);

  const customFields = readLeadCustomFields().filter((field) => field.module === moduleName && field.screen === screenName);
  const sectionsByScreen = useMemo(() => readSectionsByScreen(), []);
  const sections = useMemo(
    () => sectionsByScreen[settingsScreenKey(moduleName, screenName)] ?? sectionsByScreen[screenName] ?? [],
    [moduleName, screenName, sectionsByScreen],
  );
  const dynamicCustomFields = useMemo(
    () =>
      dynamicFields.map((field) => {
        const cachedField = customFields.find(
          (item) =>
            item.id === field.fieldKey ||
            item.label.trim().toLowerCase() === field.label.trim().toLowerCase(),
        );
        return {
          id: field.fieldKey,
          label: field.label,
          type: getCustomFieldType(field),
          required: field.required,
          module: moduleName,
          screen: screenName,
          section: cachedField?.section ?? sections[0] ?? "Custom Fields",
        } satisfies LeadCustomField;
      }),
    [customFields, dynamicFields, moduleName, screenName, sections],
  );
  const screenFields = dynamicScreen ? dynamicCustomFields : customFields;
  const groupedFields = useMemo(() => {
    const names = sections.length ? sections : Array.from(new Set(screenFields.map((field) => field.section)));
    return names.map((section) => ({
      title: section,
      fields: screenFields.filter((field) => field.section === section),
    })).filter((section) => section.fields.length > 0);
  }, [screenFields, sections]);

  return (
    <Stack gap={2}>
      <PageHeader
        eyebrow={moduleName.toUpperCase()}
        title={screenName}
        description="Configured screen form"
      />
      {groupedFields.length > 0 ? groupedFields.map((section) => <ConfiguredSection key={section.title} section={section} />) : (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">No fields have been configured for this screen yet.</Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

const getCustomFieldType = (field: MetadataField): LeadCustomField["type"] => {
  if (field.controlType === "select" || field.controlType === "lookup") {
    return "Select";
  }
  if (field.controlType === "boolean") {
    return "Boolean";
  }
  if (field.controlType === "textarea") {
    return "Long Text";
  }
  switch (field.dataType.toLowerCase()) {
    case "number":
    case "integer":
    case "decimal":
      return "Number";
    case "date":
    case "datetime":
      return "Date";
    case "boolean":
      return "Boolean";
    case "text":
    case "longtext":
    case "textarea":
      return "Long Text";
    default:
      return "Text / Char";
  }
};

const ConfiguredSection = ({ section }: { section: { title: string; fields: LeadCustomField[] } }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <FormSection title={section.title} description="Configured screen fields." collapsible defaultExpanded>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
        {section.fields.map((field) => (
          <TextField
            key={field.id}
            label={field.label}
            required={field.required}
            type={field.type === "Number" ? "number" : field.type === "Date" ? "date" : "text"}
            multiline={field.type === "Long Text"}
            minRows={field.type === "Long Text" ? 3 : undefined}
            value={values[field.id] ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
            fullWidth
            slotProps={field.type === "Date" ? { inputLabel: { shrink: true } } : undefined}
          />
        ))}
      </Box>
      <Button variant="contained" sx={{ alignSelf: "flex-start" }}>Save</Button>
    </FormSection>
  );
};
