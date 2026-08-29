import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  uppercase?: boolean;
}

export const PageHeader = ({ title, description, eyebrow, badge, actions, uppercase }: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={2}
    sx={{ mb: 2.5 }}
  >
    <Box>
      {eyebrow ? (
        <Typography
          variant="caption"
          color="blue"
          sx={{ display: "block", mb: 0.5, letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Stack direction="row" alignItems="center" gap={1.25}>
        <Typography
          variant="h1"
          sx={uppercase ? { textTransform: "uppercase", letterSpacing: "0.04em" } : undefined}
        >
          {title}
        </Typography>
        {badge}
      </Stack>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {actions ? (
      <Stack direction="row" gap={1} flexWrap="wrap">
        {actions}
      </Stack>
    ) : null}
  </Stack>
);
