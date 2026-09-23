import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { Box, Drawer, Fab, IconButton, Tooltip } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useResponsive } from "@/hooks/useResponsive";
import { sessionCleared } from "@/redux/features/auth/authSlice";
import { logoutRequest } from "@/configurations/api/authApi";
import { permissionsCleared } from "@/redux/features/permissions/permissionSlice";
import { tenantCleared } from "@/redux/features/tenant/tenantSlice";
import { mobileNavOpened, selectUi, sidebarToggled, toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Sidebar } from "../Sidebar/Sidebar";
import { Topbar } from "../Topbar/Topbar";

const EXPANDED_WIDTH = 284;
const COLLAPSED_WIDTH = 80;

export const AppLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDesktop } = useResponsive();
  const { sidebarCollapsed, mobileNavOpen } = useAppSelector(selectUi);
  const sidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const signOut = async () => {
    try {
      await logoutRequest();
    } finally {
      dispatch(sessionCleared());
      dispatch(permissionsCleared());
      dispatch(tenantCleared());
      navigate(ROUTES.login, { replace: true });
    }
  };

  const sidebar = <Sidebar collapsed={isDesktop ? sidebarCollapsed : false} onSignOut={() => void signOut()} />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: { xs: 0, md: sidebarWidth },
          flexShrink: 0,
          overflow: "visible",
          transition: (theme) =>
            theme.transitions.create("width", {
              duration: 250,
              easing: theme.transitions.easing.easeInOut,
            }),
          display: { xs: "none", md: "block" },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            right: "auto",
            width: sidebarWidth,
            overflow: "visible",
            zIndex: (theme) => theme.zIndex.appBar + 1,
            transition: (theme) =>
              theme.transitions.create("width", {
                duration: 250,
                easing: theme.transitions.easing.easeInOut,
              }),
          }}
        >
          {sidebar}
          <IconButton
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => dispatch(sidebarToggled())}
            sx={{
              position: "absolute",
              top: 30,
              right: -10,
              width: 20,
              height: 20,
              minWidth: 25,
              minHeight: 25,
              borderRadius: "50%",
              zIndex: (theme) => theme.zIndex.appBar + 1,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Drawer
        open={mobileNavOpen}
        onClose={() => dispatch(mobileNavOpened(false))}
        sx={{ display: { md: "none" } }}
        PaperProps={{ sx: { width: EXPANDED_WIDTH } }}
      >
        {sidebar}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onMenuClick={() => dispatch(mobileNavOpened(true))} />
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 1.25, md: 1.75 } }}>
          <Box
            sx={{
              minHeight: { md: "calc(100vh - 104px)" },
              borderRadius: 2.5,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              p: { xs: 1.75, md: 2.5 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      <Tooltip title="AI Assistant">
        <Fab
          color="primary"
          aria-label="Open AI assistant"
          onClick={() =>
            dispatch(toastShown({ message: "AI Control Room is reserved for a later phase.", severity: "info" }))
          }
          sx={{ position: "fixed", right: 24, bottom: 24, borderRadius: 2 }}
        >
          <SmartToyOutlinedIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
