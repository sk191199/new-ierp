import { Stack } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { selectPermissions } from "@/redux/features/permissions/permissionSlice";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { isBlank } from "@/utils/validators/required";
import type { MetadataAction, ScreenMetadata } from "@/models/metadata/metadata";
import { getScreenMetadata } from "@/configurations/api/metadataApi";
import { MetadataActionRenderer } from "./MetadataActionRenderer";
import { MetadataSectionRenderer } from "./MetadataSectionRenderer";

interface GenericPageProps {
  screenCode: string;
  initialValues?: Record<string, string | number | boolean>;
  onAction?: (
    action: MetadataAction,
    values: Record<string, string | number | boolean>,
    metadata: ScreenMetadata,
  ) => Promise<void> | void;
}

export const GenericPage = ({ screenCode, initialValues, onAction }: GenericPageProps) => {
  const dispatch = useAppDispatch();
  const { deniedFields } = useAppSelector(selectPermissions);
  const [metadata, setMetadata] = useState<ScreenMetadata | null>(null);
  const [values, setValues] = useState<Record<string, string | number | boolean>>(initialValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getScreenMetadata(screenCode);
      setMetadata(next);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [screenCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const requiredKeys = useMemo(
    () =>
      metadata?.sections.flatMap((section) =>
        section.fields.filter((field) => field.required && field.visible).map((field) => field.fieldKey),
      ) ?? [],
    [metadata],
  );

  const handleAction = async (action: MetadataAction) => {
    if (!metadata) {
      return;
    }

    const nextErrors: Record<string, string> = {};
    requiredKeys.forEach((key) => {
      if (isBlank(String(values[key] ?? ""))) {
        nextErrors[key] = "This field is required.";
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      dispatch(toastShown({ message: "Please complete the required fields.", severity: "warning" }));
      return;
    }

    setSubmitting(true);
    try {
      await onAction?.(action, values, metadata);
      dispatch(toastShown({ message: `${action.label} completed.`, severity: "success" }));
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading screen metadata…" />;
  }

  if (error || !metadata) {
    return <ErrorState message={error ?? "Screen metadata is unavailable."} onRetry={() => void load()} />;
  }

  return (
    <Stack gap={2}>
      <PageHeader
        eyebrow={`SCREEN · ${metadata.screen.renderMode.toUpperCase()}`}
        title={metadata.screen.name}
        description={`${metadata.screen.entityName} · metadata-driven renderer with custom-field merge.`}
        actions={
          <MetadataActionRenderer actions={metadata.actions} loading={submitting} onAction={(action) => void handleAction(action)} />
        }
      />
      {metadata.sections.map((section) => (
        <MetadataSectionRenderer
          key={section.code}
          section={section}
          values={values}
          errors={errors}
          deniedFields={deniedFields}
          onChange={(fieldKey, value) => {
            setValues((current) => ({ ...current, [fieldKey]: value }));
            setErrors((current) => ({ ...current, [fieldKey]: "" }));
          }}
        />
      ))}
    </Stack>
  );
};
