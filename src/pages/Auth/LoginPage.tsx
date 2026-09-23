import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { loginRequest } from "@/configurations/api/authApi";
import { sessionEstablished, sessionFailed } from "@/redux/features/auth/authSlice";
import { permissionsLoaded } from "@/redux/features/permissions/permissionSlice";
import { tenantLoaded } from "@/redux/features/tenant/tenantSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenantCode, setTenantCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await loginRequest({ tenantCode, email, password });
      dispatch(sessionEstablished({ user: result.user, accessToken: result.accessToken }));
      dispatch(permissionsLoaded({ roles: result.roles, permissions: result.permissions }));
      dispatch(tenantLoaded({ tenantId: result.user.tenantId, tenantName: result.user.tenantName }));
      navigate(redirectTo, { replace: true });
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
      dispatch(sessionFailed(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        bgcolor: "background.default",
        backgroundImage:
          theme.palette.mode === "dark"
            ? `radial-gradient(circle at top, ${theme.palette.chrome.hover} 0%, ${theme.palette.background.default} 55%)`
            : `radial-gradient(circle at top, ${theme.palette.primary.light}22 0%, ${theme.palette.background.default} 55%)`,
      })}
    >
      <Paper sx={{ width: "100%", maxWidth: 440, p: { xs: 3, md: 4 } }}>
        <Stack gap={2.5} component="form" onSubmit={(event) => void onSubmit(event)}>
          <Box>
            <Typography variant="caption" color="primary.light">
              I-ERP INTELLIGENT
            </Typography>
            <Typography variant="h1" sx={{ mt: 0.75 }}>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Access tokens expire according to the backend session policy.
            </Typography>
          </Box>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Tenant Code"
            value={tenantCode}
            onChange={(event) => setTenantCode(event.target.value)}
            required
            autoComplete="organization"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" disabled={submitting} sx={{ minHeight: 42 }}>
            {submitting ? "Authenticating…" : "Enter terminal"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
