import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/* ============================================================
   SECTION TITLE + DESCRIPTION
   ============================================================ */

const SectionCopy = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <Box>
    <Typography
      variant="h3"
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: "1rem",
        fontWeight: 700,
        lineHeight: 1.35,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {title}
    </Typography>

    {description ? (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.5,
          fontFamily: "Inter, sans-serif",
          fontSize: "0.8125rem",
          fontWeight: 500,
          lineHeight: 1.45,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {description}
      </Typography>
    ) : null}
  </Box>
);

/* ============================================================
   FORM SECTION
   ============================================================ */

export const FormSection = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) => {
  /* ==========================================================
     NORMAL SECTION
     ========================================================== */

  if (!collapsible) {
    return (
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2.5,
          boxShadow: "none",
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            mb: 2,
          }}
        >
          <SectionCopy
            title={title}
            description={description}
          />
        </Box>

        {/* Section Content */}
        <Stack
          gap={2}
          sx={{
            px: 1,
            pb: 1,
          }}
        >
          {children}
        </Stack>
      </Paper>
    );
  }

  /* ==========================================================
     COLLAPSIBLE SECTION
     ========================================================== */

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: "12px !important",
        boxShadow: "none",
        backgroundImage: "none",
        overflow: "hidden",
        transition: (theme) =>
          theme.transitions.create(["border-color", "box-shadow"], {
            duration: theme.transitions.duration.short,
          }),

        "&:before": {
          display: "none",
        },

        "&.Mui-expanded": {
          margin: 0,
          borderColor: "primary.main",
          boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}1A`,
        },
      }}
    >
      {/* ======================================================
          COLLAPSE HEADER
          ====================================================== */}

      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          minHeight: 76,
          cursor: "pointer",
          borderRadius: 0,

          transition: (theme) =>
            theme.transitions.create("background-color", {
              duration: theme.transitions.duration.short,
            }),

          "&:hover": {
            bgcolor: "action.hover",
          },

          "&:active": {
            bgcolor: "action.selected",
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },

          "& .MuiAccordionSummary-content.Mui-expanded": {
            my: 1,
          },

          "& .MuiAccordionSummary-expandIconWrapper": {
            transform: "rotate(0deg)",
            color: "text.secondary",
            transition: "transform 200ms ease, color 150ms ease",
          },

          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(180deg)",
            color: "primary.main",
          },
        }}
      >
        <SectionCopy
          title={title}
          description={description}
        />
      </AccordionSummary>

      {/* ======================================================
          COLLAPSE CONTENT
          ====================================================== */}

      <AccordionDetails
        sx={{
          px: { xs: 2, md: 2.5 },
          pb: { xs: 2, md: 2.5 },
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          gap={2}
          sx={{
            px: 1,
            pb: 1,
          }}
        >
          {children}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};