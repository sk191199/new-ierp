import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material/Chip";

type StatusTone = "default" | "success" | "warning" | "error" | "info";

const toneByStatus: Record<string, StatusTone> = {
  New: "default",
  Qualified: "success",
  Disqualified: "error",
  Paid: "success",
  Pending: "warning",
  Draft: "default",
  Live: "info",
};

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  size?: ChipProps["size"];
}

export const StatusChip = ({ label, tone, size = "small" }: StatusChipProps) => {
  const resolved = tone ?? toneByStatus[label] ?? "default";

  return (
    <Chip
      label={label}
      size={size}
      color={resolved === "default" ? "default" : resolved}
      variant="outlined"
    />
  );
};
