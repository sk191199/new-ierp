import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface LoadingStateProps {
  label?: string;
  minHeight?: number;
  delayMs?: number;
}

export const LoadingState = ({
  label = "Loading records…",
  minHeight = 240,
  delayMs = 0,
}: LoadingStateProps) => {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const timeoutId = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs]);

  if (!visible) {
    return <Box aria-busy="true" sx={{ minHeight, width: "100%" }} />;
  }

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight, width: "100%" }} gap={1.5}>
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
};

export const BlockSkeleton = ({ height = 88 }: { height?: number }) => (
  <Box
    sx={{
      height,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      bgcolor: "background.paper",
      opacity: 0.7,
    }}
  />
);
