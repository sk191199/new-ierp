import AddIcon from "@mui/icons-material/Add";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";

import { Children, isValidElement, useState, type ReactNode } from "react";
import type { Theme } from "@mui/material/styles";

/* ============================================================
   COMMON FIELD STYLES
   ============================================================ */

const fieldLabelSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.75rem",
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const fieldInputSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const fieldPlaceholderSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "11px",
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  opacity: 0.7,
};

const fieldHelperTextSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.7rem",
  fontWeight: 400,
  lineHeight: 1.4,
  textTransform: "uppercase",
};

const menuItemSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.8125rem",
  fontWeight: 500,
  textTransform: "uppercase",
  minHeight: 44,
  px: 2,
  py: 1,
  "&:hover, &.Mui-selected:hover": {
    bgcolor: "action.hover",
  },
};

const fieldControlSx = (theme: Theme) => ({
  "& .MuiInputLabel-root": {
    ...fieldLabelSx,
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    bgcolor: theme.palette.mode === "light" ? "#F8FAFD" : theme.palette.chrome.input,
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    borderRadius: 2.5,
    bgcolor: theme.palette.mode === "light" ? "#F8FAFD" : theme.palette.chrome.input,
    transition: theme.transitions.create(["background-color", "box-shadow"], {
      duration: theme.transitions.duration.short,
    }),
    "& fieldset": {
      borderColor: theme.palette.divider,
      transition: theme.transitions.create("border-color", {
        duration: theme.transitions.duration.short,
      }),
    },
    "&:hover": {
      bgcolor: theme.palette.mode === "light" ? "#F4F7FC" : theme.palette.chrome.hover,
      "& fieldset": {
        borderColor: theme.palette.chrome.borderStrong,
      },
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}1A`,
      "& fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    "&.Mui-error": {
      "& fieldset": {
        borderColor: theme.palette.error.main,
      },
    },
    "&.Mui-disabled": {
      bgcolor: theme.palette.action.disabledBackground,
    },
    "&.MuiInputBase-multiline": {
      alignItems: "flex-start",
      py: 0.5,
    },
  },
  "& .MuiInputBase-input, & .MuiSelect-select": {
    ...fieldInputSx,
    px: 1.75,
    py: 1.25,
  },
  "& .MuiInputBase-inputMultiline": {
    py: 1,
  },
  "& .MuiInputBase-input::placeholder": {
    ...fieldPlaceholderSx,
  },
  "& .MuiFormHelperText-root": {
    ...fieldHelperTextSx,
    mt: 0.75,
    mx: 0.5,
  },
});

/* ============================================================
   BASE FIELD PROPS
   ============================================================ */

interface BaseFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

/* ============================================================
   TEXT FIELD
   ============================================================ */

// interface TextLikeProps extends BaseFieldProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   multiline?: boolean;
//   minRows?: number;
//   type?: "text" | "email" | "tel" | "number" | "date" | "url";
// }
interface TextLikeProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
  type?: "text" | "email" | "tel" | "number" | "date" | "url";
  min?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  readOnly?: boolean;
}

// export const TextFieldControl = ({
//   label,
//   name,
//   value,
//   onChange,
//   required,
//   disabled,
//   error,
//   placeholder,
//   multiline,
//   minRows,
//   type = "text",
// }: TextLikeProps) => (
//   <TextField
//     name={name}
//     label={label}
//     value={value}
//     onChange={(event) => onChange(event.target.value)}
//     required={required}
//     disabled={disabled}
//     error={Boolean(error)}
//     helperText={error}
//     placeholder={placeholder}
//     multiline={multiline}
//     minRows={minRows}
//     type={type}
//     fullWidth
//     slotProps={{
//       inputLabel: {
//         shrink: type === "date" ? true : undefined,
//         sx: fieldLabelSx,
//       },

//       input: {
//         sx: {
//           ...fieldInputSx,

//           "&::placeholder": {
//             ...fieldPlaceholderSx,
//           },
//         },
//       },

//       formHelperText: {
//         sx: fieldHelperTextSx,
//       },
//     }}
//   />
// );
export const TextFieldControl = ({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
  error,
  placeholder,
  multiline,
  minRows,
  type = "text",
  min,
  inputMode,
  readOnly,
}: TextLikeProps) => (
  <TextField
    name={name}
    data-field-key={name}
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    required={required}
    disabled={disabled}
    error={Boolean(error)}
    helperText={error}
    placeholder={placeholder}
    multiline={multiline}
    minRows={minRows}
    type={type}
    fullWidth
    sx={fieldControlSx}
    slotProps={{
      inputLabel: type === "date" ? { shrink: true, sx: fieldLabelSx } : { sx: fieldLabelSx },
      htmlInput: {
        min,
        inputMode,
      },
      input: {
        readOnly,
        sx: fieldInputSx,
      },
      formHelperText: { sx: fieldHelperTextSx },
    }}
  />
);

/* ============================================================
   SELECT FIELD
   ============================================================ */

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  includeEmpty?: boolean;
  emptyLabel?: string;
}

export const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required,
  disabled,
  error,
  includeEmpty,
  emptyLabel = "Select",
}: SelectFieldProps) => {
  const hasEmptyOption =
    Boolean(includeEmpty) ||
    options.some((option) => option.value === "");

  const shrink = Boolean(value) || hasEmptyOption;

  return (
    <FormControl
      fullWidth
      size="small"
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={fieldControlSx}
    >
      {/* ======================================================
          SELECT LABEL
          ====================================================== */}

      <InputLabel
        id={`${name}-label`}
        shrink={shrink}
        sx={fieldLabelSx}
      >
        {label}
      </InputLabel>

      {/* ======================================================
          SELECT
          ====================================================== */}

      <Select
        labelId={`${name}-label`}
        name={name}
        data-field-key={name}
        label={label}
        value={value}
        displayEmpty={hasEmptyOption}
        notched={shrink}
        onChange={(event: SelectChangeEvent<string>) =>
          onChange(event.target.value)
        }
        sx={fieldInputSx}
        renderValue={(selected) => {
          const match = options.find(
            (option) => option.value === selected
          )?.label;

          if (match) {
            return match;
          }

          if (hasEmptyOption) {
            return (
              <Box
                component="span"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  color: "text.disabled",
                }}
              >
                {emptyLabel}
              </Box>
            );
          }

          return "";
        }}
      >
        {/* Empty option */}

        {includeEmpty ? (
          <MenuItem
            value=""
            sx={menuItemSx}
          >
            <em>{emptyLabel}</em>
          </MenuItem>
        ) : null}

        {/* Options */}

        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={menuItemSx}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {/* Error */}

      {error ? (
        <FormHelperText sx={fieldHelperTextSx}>
          {error}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
};

/* ============================================================
   CREATABLE SELECT FIELD
   ============================================================ */

interface CreatableSelectFieldProps extends SelectFieldProps {
  onCreateOption: (value: string) => void;
  createTitle?: string;
}

export const CreatableSelectField = ({
  onCreateOption,
  createTitle = "Add option",
  ...selectProps
}: CreatableSelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [createError, setCreateError] =
    useState<string | undefined>();

  const commit = () => {
    const next = draft.trim();

    if (!next) {
      setCreateError("Enter a name to add.");
      return;
    }

    const exists = selectProps.options.some(
      (option) =>
        option.value.toLowerCase() === next.toLowerCase() ||
        option.label.toLowerCase() === next.toLowerCase()
    );

    if (exists) {
      setCreateError("That option already exists.");
      return;
    }

    onCreateOption(next);

    setDraft("");
    setCreateError(undefined);
    setOpen(false);
  };

  return (
    <Box
      sx={{
        position: "relative",

        "&:hover .ierp-create-option, &:focus-within .ierp-create-option":
          {
            opacity: 1,
          },
      }}
    >
      <SelectField
        {...selectProps}
        includeEmpty={selectProps.includeEmpty ?? true}
      />

      {/* Add button */}

      <Tooltip title={createTitle}>
        <IconButton
          className="ierp-create-option"
          aria-label={createTitle}
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            position: "absolute",
            top: 8,
            right: 36,
            opacity: 0,
            transition: "opacity 140ms ease",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            width: 24,
            height: 24,
            borderRadius: 1.5,
            color: "primary.main",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.08)",

            "&:hover": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
            },

            "@media (hover: none)": {
              opacity: 1,
            },
          }}
        >
          <AddIcon
            sx={{
              fontSize: 16,
            }}
          />
        </IconButton>
      </Tooltip>

      {/* ======================================================
          CREATE OPTION DIALOG
          ====================================================== */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {createTitle}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setCreateError(undefined);
            }}
            error={Boolean(createError)}
            helperText={createError}
            sx={(theme) => ({
              mt: 1,
              ...fieldControlSx(theme),
            })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => {
              setOpen(false);
              setDraft("");
              setCreateError(undefined);
            }}
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={commit}
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ============================================================
   BOOLEAN FIELD
   ============================================================ */

interface BooleanFieldProps extends BaseFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  variant?: "checkbox" | "switch";
}

export const BooleanField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  variant = "checkbox",
}: BooleanFieldProps) => (
  <FormControlLabel
    control={
      variant === "switch" ? (
        <Switch
          name={name}
          checked={value}
          onChange={(_, checked) =>
            onChange(checked)
          }
          disabled={disabled}
        />
      ) : (
        <Checkbox
          name={name}
          checked={value}
          onChange={(_, checked) =>
            onChange(checked)
          }
          disabled={disabled}
        />
      )
    }
    label={label}
    sx={{
      "& .MuiFormControlLabel-label": {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        textTransform: "uppercase",
      },
    }}
  />
);

/* ============================================================
   FIELD GRID
   ============================================================ */

export const FieldGrid = ({
  children,
  fieldOrder,
  fieldVisibility,
  requiredFieldKeys,
}: {
  children: ReactNode;
  fieldOrder?: string[];
  fieldVisibility?: Record<string, boolean>;
  requiredFieldKeys?: string[];
}) => {
  const orderMap = new Map((fieldOrder ?? []).map((fieldKey, index) => [fieldKey, index]));
  const requiredKeys = new Set(requiredFieldKeys ?? []);

  return (
  <Stack
    sx={{
      display: "grid",
      gap: { xs: 2, md: 2.5 },
      "& > [data-field-key=\"address\"]": {
        gridColumn: "1 / -1",
      },
      "& > [data-field-key=\"followUpNotes\"]": {
        gridColumn: "1 / -1",
      },

      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      },
    }}
  >
    {Children.map(children, (child) => {
      if (!isValidElement(child)) {
        return child;
      }

      const fieldKey = child.props.name as string | undefined;
      const order = fieldKey ? orderMap.get(fieldKey) ?? fieldOrder?.length ?? 0 : fieldOrder?.length ?? 0;
      const hidden = fieldKey ? fieldVisibility?.[fieldKey] === false && !requiredKeys.has(fieldKey) : false;
      return (
        <Box key={fieldKey ?? String(child.key)} data-field-key={fieldKey} sx={{ order, minWidth: 0, display: hidden ? "none" : undefined }}>
          {child}
        </Box>
      );
    })}
  </Stack>
  );
};