import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Box, Button, List, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/hooks/useAuth";
import { navigationItems } from "./navigationConfig";
import { SidebarItem } from "./SidebarItem";

interface SidebarProps {
  collapsed: boolean;
  onSignOut: () => void;
}

export const Sidebar = ({ collapsed, onSignOut }: SidebarProps) => {
  const { user } = useAuth();

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

      <List sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
        {navigationItems.map((item) => (
          <SidebarItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </List>

      <Stack
        gap={collapsed ? 1.25 : 1}
        sx={{
          p: collapsed ? 1.25 : 1.75,
          borderTop: 1,
          borderColor: "chrome.sidebarBorder",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Avatar
            sx={{
              width: collapsed ? 36 : 34,
              height: collapsed ? 36 : 34,
              bgcolor: "primary.dark",
              fontSize: collapsed ? 14 : 13,
              fontWeight: 700,
              borderRadius: collapsed ? 1.5 : 1.25,
            }}
          >
            {user?.initials ?? "AM"}
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
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  color: "chrome.sidebarText",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {user?.displayName ?? "Aarav Mehta"}
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: "success.main", fontSize: "0.58rem", letterSpacing: "0.07em", lineHeight: 1.2 }}
                >
                  {user?.roleName ?? "Global Admin"}
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
              minHeight: 34,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.09em",
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
