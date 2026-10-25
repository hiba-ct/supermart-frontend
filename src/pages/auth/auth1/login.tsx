import { Link } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Logo from "components/logo";
import AuthWrapper from "sections/auth/AuthWrapper";
import AuthLogin from "sections/auth/auth-forms/AuthLogin";

// ================================|| LOGIN ||================================ //

export default function Login() {
  return (
    <AuthWrapper>

      <Stack
        direction="column"
        sx={{
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: {
            xs: -0.5,
            sm: 0.5,
          },
        }}
      >

        <Grid container spacing={3}>

          {/* LOGO */}
          <Grid
            sx={{ textAlign: "center" }}
            size={12}
          >
            <Logo />
          </Grid>

          {/* TITLE */}
          <Grid size={12}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: {
                  xs: -0.5,
                  sm: 0.5,
                },
              }}
            >
              <Typography variant="h3">
                Login
              </Typography>
            </Stack>
          </Grid>

          {/* LOGIN FORM */}
          <Grid size={12}>
            <AuthLogin />
          </Grid>

        </Grid>

      </Stack>

    </AuthWrapper>
  );
}