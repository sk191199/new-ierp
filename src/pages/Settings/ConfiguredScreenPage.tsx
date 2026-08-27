import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { readLeadCustomFields, type LeadCustomField } from "@/pages/CRM/Leads/leadFieldOrder";
import { readSectionsByScreen, settingsScreenKey, settingsSlug } from "./settingsCatalog";
import { readSettingsCatalog } from "./settingsCatalog";

export const ConfiguredScreenPage = () => {
  const { module: moduleSlug, screen: screenSlug } = useParams();
  const catalog = readSettingsCatalog();
  const moduleName = catalog.modules.find((value) => settingsSlug(value) === moduleSlug) ?? "Configured Module";
  const screenName = (catalog.screensByModule[moduleName] ?? []).find((value) => settingsSlug(value) === screenSlug) ?? "Configured Screen";
  const customFields = readLeadCustomFields().filter((field) => field.module === moduleName && field.screen === screenName);
  const sectionsByScreen = useMemo(() => readSectionsByScreen(), []);
  const sections = useMemo(
    () => sectionsByScreen[settingsScreenKey(moduleName, screenName)] ?? sectionsByScreen[screenName] ?? [],
    [moduleName, screenName, sectionsByScreen],
  );
  const groupedFields = useMemo(() => {
    const names = sections.length ? sections : Array.from(new Set(customFields.map((field) => field.section)));
    return names.map((section) => ({
      title: section,
      fields: customFields.filter((field) => field.section === section),
    })).filter((section) => section.fields.length > 0);
  }, [customFields, sections]);

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
