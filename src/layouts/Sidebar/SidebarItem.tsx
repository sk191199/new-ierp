import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import type { NavigationItem } from "./navigationConfig";

interface SidebarItemProps {
  item: NavigationItem;
  collapsed: boolean;
}

const isPathActive = (pathname: string, path?: string): boolean => {
  if (!path) {
    return false;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};

export const SidebarItem = ({ item, collapsed }: SidebarItemProps) => {
  const location = useLocation();
  const { can } = usePermissions();
  const childItems = item.children?.filter((child) => can(child.permission)) ?? [];
  const hasChildren = childItems.length > 0;
  const childActive = childItems.some((child) => isPathActive(location.pathname, child.path));
  const selfActive = isPathActive(location.pathname, item.path);
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) {
      setOpen(true);
    }
  }, [childActive]);

  if (!can(item.permission)) {
    return null;
  }

  if (hasChildren && !item.path) {
    return (
      <Box>
        <Tooltip title={collapsed ? item.label : ""} placement="right">
          <ListItemButton onClick={() => setOpen((current) => !current)} sx={parentButtonSx(collapsed, childActive || selfActive)}>
            <ListItemIcon sx={iconSx(childActive || selfActive)}>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <Box sx={labelVisibilitySx(collapsed)}>
              <ListItemText primary={item.label} primaryTypographyProps={parentLabelProps} />
            </Box>
            <Box sx={chevronVisibilitySx(collapsed)}>
              {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </Box>
          </ListItemButton>
        </Tooltip>
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <List disablePadding>
            {childItems.map((child) => (
              <ChildLink key={child.path} label={child.label} path={child.path} pathname={location.pathname} />
            ))}
          </List>
        </Collapse>
      </Box>
    );
  }

  return (
    <Tooltip title={collapsed ? item.label : ""} placement="right">
      <ListItemButton component={NavLink} to={item.path ?? "/"} sx={leafButtonSx(selfActive, collapsed)}>
        <ListItemIcon sx={iconSx(selfActive)}>
          <item.icon fontSize="small" />
        </ListItemIcon>
        <Box sx={labelVisibilitySx(collapsed)}>
          <ListItemText primary={item.label} primaryTypographyProps={parentLabelProps} />
        </Box>
      </ListItemButton>
    </Tooltip>
  );
};

const ChildLink = ({ label, path, pathname }: { label: string; path: string; pathname: string }) => {
  const active = isPathActive(pathname, path);
  return (
    <ListItemButton component={NavLink} to={path} selected={active} sx={childButtonSx(active)}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          mr: 1.25,
          flexShrink: 0,
          bgcolor: active ? "primary.main" : "transparent",
          boxShadow: (theme) => (active ? `0 0 8px ${alpha(theme.palette.primary.main, 0.85)}` : "none"),
        }}
      />
      <ListItemText primary={label} primaryTypographyProps={childLabelProps} />
    </ListItemButton>
  );
};

const parentLabelProps = {
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const childLabelProps = {
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

const parentButtonSx = (collapsed: boolean, active: boolean) => ({
  mx: 1,
  mb: 0.25,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  borderRadius: 1.5,
  justifyContent: collapsed ? "center" : "flex-start",
  color: active ? "common.white" : "chrome.sidebarMuted",
  bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.88) : "transparent"),
  "&:hover": {
    bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.94) : theme.palette.chrome.sidebarHover),
  },
});

const leafButtonSx = (active: boolean, collapsed: boolean) => ({
  mx: 1,
  mb: 0.4,
  minHeight: 40,
  display: "flex",
  alignItems: "center",
  borderRadius: 2,
  justifyContent: collapsed ? "center" : "flex-start",
  color: active ? "common.white" : "chrome.sidebarMuted",
  bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.88) : "transparent"),
  "&:hover": {
    bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.94) : theme.palette.chrome.sidebarHover),
  },
  "&.Mui-selected": {
    bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.88),
    color: "common.white",
  },
});

const childButtonSx = (active: boolean) => ({
  mx: 1.25,
  mb: 0.35,
  minHeight: 34,
  display: "flex",
  alignItems: "center",
  borderRadius: 2,
  pl: 1.5,
  color: active ? "common.white" : "chrome.sidebarMuted",
  bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.88) : "transparent"),
  "&:hover": {
    bgcolor: (theme: Theme) => (active ? alpha(theme.palette.primary.main, 0.94) : theme.palette.chrome.sidebarHover),
  },
  "&.Mui-selected": {
    bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.88),
    color: "common.white",
    "&:hover": {
      bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.94),
    },
  },
});

const iconSx = (active: boolean) => ({
  minWidth: 32,
  width: 32,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  color: active ? "common.white" : "chrome.sidebarMuted",
});

const labelVisibilitySx = (collapsed: boolean) => ({
  minWidth: 0,
  flex: collapsed ? 0 : 1,
  maxWidth: collapsed ? 0 : 220,
  overflow: "hidden",
  opacity: collapsed ? 0 : 1,
  whiteSpace: "nowrap",
  transition: (theme: Theme) =>
    theme.transitions.create(["max-width", "opacity"], {
      duration: 250,
      easing: theme.transitions.easing.easeInOut,
    }),
});

  const chevronVisibilitySx = (collapsed: boolean) => ({
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    ml: "auto",
    maxWidth: collapsed ? 0 : 24,
    overflow: "hidden",
    opacity: collapsed ? 0 : 1,
    transition: (theme: Theme) =>
      theme.transitions.create(["max-width", "opacity"], {
        duration: 250,
        easing: theme.transitions.easing.easeInOut,
      }),
  });
