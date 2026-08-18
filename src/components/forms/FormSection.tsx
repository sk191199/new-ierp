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
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.4,
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
          fontSize: "10px",
          fontWeight: 500,
          lineHeight: 1.5,
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
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
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
        borderRadius: "16px !important",
        boxShadow: "none",
        backgroundImage: "none",
        overflow: "hidden",

        "&:before": {
          display: "none",
        },

        "&.Mui-expanded": {
          margin: 0,
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
          py: 1.25,
          minHeight: 64,
          cursor: "pointer",
          borderRadius: "16px",

          transition: "background-color 150ms ease",

          "&:hover": {
            bgcolor: "action.hover",
          },

          "& .MuiAccordionSummary-content": {
            my: 1,
          },

          "& .MuiAccordionSummary-expandIconWrapper": {
            transform: "rotate(0deg)",
            transition: "transform 200ms ease",
          },

          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(180deg)",
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
          pt: 0,
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