// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import GraphicEqIcon from "@mui/icons-material/GraphicEq";
// import MenuIcon from "@mui/icons-material/Menu";
// import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
// import SearchIcon from "@mui/icons-material/Search";
// import {
//   AppBar,
//   Badge,
//   Box,
//   IconButton,
//   InputAdornment,
//   Stack,
//   TextField,
//   Toolbar,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import { useAppSelector } from "@/redux/hooks";
// import { selectTenant } from "@/redux/features/tenant/tenantSlice";
// import { ThemeToggle } from "./ThemeToggle";

// interface TopbarProps {
//   onMenuClick: () => void;
// }

// const chromeButtonSx = {
//   width: 40,
//   height: 40,
//   border: 1,
//   borderColor: "divider",
//   borderRadius: 1.5,
// } as const;

// export const Topbar = ({ onMenuClick }: TopbarProps) => {
//   const tenant = useAppSelector(selectTenant);

//   return (
//     <AppBar position="sticky" color="transparent">
//       <Toolbar
//         sx={{
//           gap: 1.5,
//           minHeight: { xs: 64, md: 72 },
//           px: { xs: 1.5, md: 2.5 },
//           justifyContent: "flex-start",
//         }}
//       >
//         <IconButton aria-label="Open navigation" onClick={onMenuClick} sx={{ display: { md: "none" } }}>
//           <MenuIcon />
//         </IconButton>

//         <TextField
//           placeholder="SEARCH DOCUMENTS, ENTITIES, OR AI ACTIONS..."
//           sx={{
//             flex: 1,
//             maxWidth: { xs: "100%", md: 560, lg: 640 },
//             mr: "auto",
//             "& .MuiOutlinedInput-root": {
//               borderRadius: 999,
//               bgcolor: "background.default",
//             },
//           }}
//           slotProps={{
//             input: {
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon fontSize="small" />
//                 </InputAdornment>
//               ),
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <Box
//                     sx={{
//                       px: 0.75,
//                       py: 0.25,
//                       borderRadius: 1,
//                       border: 1,
//                       borderColor: "divider",
//                       color: "text.secondary",
//                       fontSize: "0.68rem",
//                       letterSpacing: "0.04em",
//                       fontWeight: 700,
//                     }}
//                   >
//                     ⌘ K
//                   </Box>
//                 </InputAdornment>
//               ),
//             },
//           }}
//           inputProps={{ "aria-label": "Global search" }}
//         />

//         <Stack direction="row" alignItems="center" gap={1} sx={{ ml: "auto" }}>
//           <Stack
//             direction="row"
//             alignItems="center"
//             gap={1}
//             sx={{
//               display: { xs: "none", md: "flex" },
//               px: 1.5,
//               py: 0.75,
//               borderRadius: 999,
//               border: 1,
//               borderColor: "divider",
//               bgcolor: "chrome.input",
//             }}
//           >
//             <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "warning.main" }} />
//             <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />
//             <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.light" }} />
//             <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
//               LIVE NEURAL MONITOR
//             </Typography>
//             <ExpandMoreIcon sx={{ fontSize: 18, color: "text.secondary" }} />
//           </Stack>

//           <ThemeToggle />

//           <Tooltip title="Notifications">
//             <IconButton aria-label="Notifications" sx={chromeButtonSx}>
//               <Badge color="primary" variant="dot">
//                 <NotificationsNoneIcon />
//               </Badge>
//             </IconButton>
//           </Tooltip>

//           <Stack
//             direction="row"
//             alignItems="center"
//             gap={1.25}
//             sx={{ display: { xs: "none", lg: "flex" }, pl: 0.5 }}
//           >
//             <Box>
//               <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1.2 }}>
//                 HQ TERMINAL
//               </Typography>
//               <Typography variant="caption" sx={{ color: "primary.light", letterSpacing: "0.08em" }}>
//                 {tenant.nodeLabel}
//               </Typography>
//             </Box>
//             <Box
//               sx={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 1.5,
//                 bgcolor: "primary.main",
//                 color: "primary.contrastText",
//                 display: "grid",
//                 placeItems: "center",
//               }}
//             >
//               <GraphicEqIcon fontSize="small" />
//             </Box>
//           </Stack>
//         </Stack>
//       </Toolbar>
//     </AppBar>
//   );
// };


import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import { useAppSelector } from "@/redux/hooks";
import { selectTenant } from "@/redux/features/tenant/tenantSlice";

import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

const chromeButtonSx = {
  width: 40,
  height: 40,
  border: 1,
  borderColor: "divider",
  borderRadius: 1.5,
} as const;

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const tenant = useAppSelector(selectTenant);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        borderRadius: 0,
      }}
    >
      <Toolbar
        sx={{
          gap: 1.5,
          minHeight: { xs: 64, md: 72 },
          px: { xs: 1.5, md: 2.5 },
          justifyContent: "flex-start",
        }}
      >
        <IconButton
          aria-label="Open navigation"
          onClick={onMenuClick}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <TextField
          placeholder="SEARCH DOCUMENTS, ENTITIES, OR AI ACTIONS..."
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", md: 560, lg: 640 },
            mr: "auto",
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              bgcolor: "background.default",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      color: "text.secondary",
                      fontSize: "0.68rem",
                      letterSpacing: "0.04em",
                      fontWeight: 700,
                    }}
                  >
                    ⌘ K
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          inputProps={{ "aria-label": "Global search" }}
        />

        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ ml: "auto" }}
        >
          {/* LIVE NEURAL MONITOR */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              display: { xs: "none", md: "flex" },
              width: "fit-content",
              height: 40,
              boxSizing: "border-box",
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: 1,
              borderColor: "divider",
              bgcolor: "chrome.input",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "warning.main",
              }}
            />

            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
              }}
            />

            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.light",
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: "0.08em" }}
            >
              LIVE NEURAL MONITOR
            </Typography>

            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
              }}
            />
          </Stack>

          <ThemeToggle />

          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={chromeButtonSx}
            >
              <Badge color="primary" variant="dot">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Stack
            direction="row"
            alignItems="center"
            gap={1.25}
            sx={{
              display: { xs: "none", lg: "flex" },
              pl: 0.5,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  lineHeight: 1.2,
                }}
              >
                HQ TERMINAL
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "primary.light",
                  letterSpacing: "0.08em",
                }}
              >
                {tenant.nodeLabel}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <GraphicEqIcon fontSize="small" />
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};