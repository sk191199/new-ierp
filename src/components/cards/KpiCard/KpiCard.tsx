import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { KpiIconKey, KpiMetric } from "@/models/dashboard/dashboard";

interface KpiCardProps {
  metric: KpiMetric;
}

const kpiIcons: Record<KpiIconKey, typeof PeopleAltOutlinedIcon> = {
  people: PeopleAltOutlinedIcon,
  check: CheckCircleOutlineIcon,
  trend: TrendingUpIcon,
};

const kpiCardSx = (theme: Theme) => ({
  height: "100%",
  borderRadius: 2.5,
  transition: theme.transitions.create(["transform", "box-shadow", "border-color"], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeOut,
  }),
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: `0 12px 28px ${theme.palette.primary.main}2E`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    "&:hover": {
      transform: "none",
    },
  },
});

export const KpiCard = ({ metric }: KpiCardProps) => {
  const trend = metric.trendPercent;
  const isPositive = (trend ?? 0) >= 0;
  const trendColor =
    metric.tone === "error" || (!metric.tone && !isPositive)
      ? "error.main"
      : metric.tone === "warning"
        ? "warning.main"
        : "success.main";
  const Icon = metric.icon ? kpiIcons[metric.icon] : null;
  const badgeLabel =
    metric.trendLabel ??
    (trend !== undefined ? `${isPositive ? "+" : ""}${trend.toFixed(1)}%` : undefined);

  if (Icon) {
    return (
      <Card sx={kpiCardSx}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "chrome.hover",
                color: "primary.light",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon fontSize="small" />
            </Box>
            {badgeLabel ? (
              <Chip
                size="small"
                icon={<NorthEastIcon sx={{ fontSize: 14 }} />}
                label={badgeLabel}
                sx={{
                  bgcolor: "success.main",
                  color: "primary.contrastText",
                  height: 22,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            ) : null}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2, letterSpacing: "0.12em" }}
          >
            {metric.label.toUpperCase()}
          </Typography>
          <Typography variant="h1" sx={{ mt: 0.75, fontSize: "2rem" }}>
            {metric.value}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={kpiCardSx}>
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Typography variant="caption" color="text.secondary">
          {metric.label.toUpperCase()}
        </Typography>
        <Typography variant="h2" sx={{ mt: 1, mb: 1 }}>
          {metric.value}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          {metric.hint ? (
            <Typography variant="body2" color="text.secondary">
              {metric.hint}
            </Typography>
          ) : (
            <Box />
          )}
          {trend !== undefined ? (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: trendColor }}>
              {isPositive ? <NorthEastIcon sx={{ fontSize: 16 }} /> : <SouthEastIcon sx={{ fontSize: 16 }} />}
              <Typography variant="subtitle2" sx={{ color: "inherit" }}>
                {badgeLabel}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
