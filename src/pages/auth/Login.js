import { Link as RouterLink } from "react-router-dom";
// sections
import { Stack, Typography, Link } from "@mui/material";
import AuthSocial from "../../sections/auth/AuthSocial";
import Login from "../../sections/auth/LoginForm";
import { SettingsContext } from "../../contexts/SettingsContext";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <SettingsContext.Consumer>
      {(settings) => (
        <>
          <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
            <Typography variant="h4">Login to We-meet</Typography>

            <Stack direction="row" spacing={0.5}>
              <Typography variant="body2">New user?</Typography>

              <Link
                to={"/auth/register"}
                component={RouterLink}
                variant="subtitle2"
              >
                Create an account
              </Link>
            </Stack>
          </Stack>
          {/* Form */}
          <Login />

          <AuthSocial />
        </>
      )}
    </SettingsContext.Consumer>
  );
}

