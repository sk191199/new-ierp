import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Box, Button, List, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { getCachedMetadataModules, MODULES_UPDATED_EVENT } from "@/configurations/api/modulesApi";
import { selectCurrentUser, selectIsAuthenticated } from "@/redux/features/auth/authSelectors";
import { useAppSelector } from "@/redux/hooks";
import {
  navigationItems,
  navigationItemsFromModules,
  salesNavigationItems,
  systemSettingsNavigationItems,
} from "./navigationConfig";
import { SidebarItem } from "./SidebarItem";

const moduleDisplayOrder = (code: string, name: string): number => {
  const keys = [code, name].map((value) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  if (keys.some((key) => key.startsWith("crm"))) return 0;
  if (keys.some((key) => key.startsWith("sales"))) return 1;
  if (keys.some((key) => key === "hr" || key.startsWith("humanresources"))) return 2;
  if (keys.some((key) => key.startsWith("master"))) return 3;
  return 4;
};

interface SidebarProps {
  collapsed: boolean;
  onSignOut: () => void;
}

export const Sidebar = ({ collapsed, onSignOut }: SidebarProps) => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const moduleCacheKey = user ? `${user.tenantId}:${user.id}` : null;
  const [items, setItems] = useState(() => [...navigationItems(), ...systemSettingsNavigationItems()]);

  useEffect(() => {
    let active = true;
    let latestRequestId = 0;

    const loadModules = (forceRefresh = false) => {
      if (!isAuthenticated || !moduleCacheKey) {
        return;
      }

      const requestId = ++latestRequestId;
      void getCachedMetadataModules(moduleCacheKey, forceRefresh)
        .then((modules) => {
          if (active && requestId === latestRequestId) {
            const orderedModules = [...modules].sort(
              (left, right) =>
                moduleDisplayOrder(left.code, left.name) -
                moduleDisplayOrder(right.code, right.name),
            );
            const dynamicItems = navigationItemsFromModules(orderedModules).filter(
              (item) => item.label.toLowerCase() !== "sales",
            );
            const crmModuleCount = orderedModules.filter(
              (module) => moduleDisplayOrder(module.code, module.name) === 0,
            ).length;
            dynamicItems.splice(crmModuleCount, 0, ...salesNavigationItems());
            setItems([
              ...navigationItems(),
              ...dynamicItems,
              ...systemSettingsNavigationItems(),
            ]);
          }
        })
        .catch((error: unknown) => {
          if (active && requestId === latestRequestId) {
            console.error("Failed to load sidebar modules.", error);
          }
        });
    };

    void loadModules();
    const handleModulesUpdated = () => loadModules(true);
    window.addEventListener(MODULES_UPDATED_EVENT, handleModulesUpdated);

    return () => {
      active = false;
      window.removeEventListener(MODULES_UPDATED_EVENT, handleModulesUpdated);
    };
  }, [isAuthenticated, moduleCacheKey]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "chrome.sidebar",
        color: "chrome.sidebarText",
        borderRight: 1,
        borderColor: "chrome.sidebarBorder",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.25}
        sx={{
          px: collapsed ? 1.25 : 2,
          py: 2.25,
          transition: (theme) =>
            theme.transitions.create("padding", {
              duration: 250,
              easing: theme.transitions.easing.easeInOut,
            }),
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: "1.15rem",
            flexShrink: 0,
            boxShadow: (theme) => `0 0 18px ${alpha(theme.palette.primary.main, 0.55)}`,
          }}
        >
          i
        </Box>
        <Box
          sx={{
            minWidth: 0,
            maxWidth: collapsed ? 0 : 180,
            opacity: collapsed ? 0 : 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            transition: (theme) =>
              theme.transitions.create(["max-width", "opacity"], {
                duration: 250,
                easing: theme.transitions.easing.easeInOut,
              }),
          }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1.1 }}>
              ERP
            </Typography>
            <Typography variant="caption" sx={{ color: "chrome.sidebarText", letterSpacing: "0.18em" }}>
              INTELLIGENT
            </Typography>
        </Box>
      </Stack>

      <List sx={{ flex: 1, overflowY: "auto", py: 0.5, scrollbarGutter: "stable" }}>
        {items.map((item) => (
          <SidebarItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </List>

      <Stack
        gap={1.25}
        sx={{
          p: collapsed ? 1.25 : 1.75,
          borderTop: 1,
          borderColor: "chrome.sidebarBorder",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.dark",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 1.5,
            }}
          >
            {user?.initials ?? ""}
          </Avatar>
          <Box
            sx={{
              minWidth: 0,
              flex: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : "100%",
              opacity: collapsed ? 0 : 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: (theme) =>
                theme.transitions.create(["flex", "max-width", "opacity"], {
                  duration: 250,
                  easing: theme.transitions.easing.easeInOut,
                }),
            }}
          >
              <Typography variant="subtitle2" noWrap sx={{ color: "chrome.sidebarText", fontWeight: 800 }}>
                {user?.displayName ?? ""}
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: "success.main", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  {user?.roleName ?? ""}
                </Typography>
              </Stack>
          </Box>
        </Stack>
        {collapsed ? (
          <Button
            aria-label="Sign out"
            variant="outlined"
            onClick={onSignOut}
            sx={{
              minWidth: 0,
              px: 1,
              color: "chrome.sidebarMuted",
              borderColor: "chrome.sidebarBorder",
            }}
          >
            <LogoutIcon fontSize="small" />
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={onSignOut}
            sx={{
              color: "primary.contrastText",
              borderColor: "chrome.sidebarBorder",
              letterSpacing: "0.12em",
              bgcolor: "primary.main",
              "&:hover": {
                borderColor: "chrome.borderStrong",
                bgcolor: "chrome.signoutBtnHover",
                color: "primary.contrastText",
              },
            }}
          >
            SIGN OUT
          </Button>
        )}
      </Stack>
    </Box>
  );
};
