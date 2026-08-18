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

import {
  useState,
  type ReactNode,
} from "react";

/* ============================================================
   COMMON FIELD STYLES
   ============================================================ */

const fieldLabelSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const fieldInputSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  fontWeight: 400,
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
  fontSize: "10px",
  fontWeight: 400,
  lineHeight: 1.4,
};

const menuItemSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  fontWeight: 400,
  textTransform: "uppercase",
};

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
  readOnly,
}: TextLikeProps) => (
  <TextField
    name={name}
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
    slotProps={{
      inputLabel: type === "date" ? { shrink: true } : undefined,
      htmlInput: {
        min,
      },
      input: {
        readOnly,
      },
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
        label={label}
        value={value}
        displayEmpty={hasEmptyOption}
        notched={shrink}
        onChange={(event: SelectChangeEvent<string>) =>
          onChange(event.target.value)
        }
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
        }}
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
                  fontSize: "11px",
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

            "&:hover": {
              bgcolor: "action.hover",
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
            sx={{
              mt: 1,

              "& .MuiInputLabel-root": {
                ...fieldLabelSx,
              },

              "& .MuiInputBase-input": {
                ...fieldInputSx,

                "&::placeholder": {
                  ...fieldPlaceholderSx,
                },
              },

              "& .MuiFormHelperText-root": {
                ...fieldHelperTextSx,
              },
            }}
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
}: {
  children: ReactNode;
}) => (
  <Stack
    sx={{
      display: "grid",
      gap: 2,

      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      },
    }}
  >
    {children}
  </Stack>
);