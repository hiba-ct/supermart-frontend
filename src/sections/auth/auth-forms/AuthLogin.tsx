import { useState, SyntheticEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Material UI
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// Project imports
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// Assets
import { Eye, EyeSlash } from 'iconsax-reactjs';

// ============================|| LOGIN ||============================ //

export default function AuthLogin({
  forgot
}: {
  forgot?: string;
}) {
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auth context
  const { isLoggedIn, login } = useAuth();

  // React Router navigation
  const navigate = useNavigate();

  // Prevent state update after unmount
  const scriptedRef = useScriptRef();

  // =========================================================
  // SHOW / HIDE PASSWORD
  // =========================================================

  const handleClickShowPassword = () => {
    setShowPassword((previous) => !previous);
  };

  const handleMouseDownPassword = (
    event: SyntheticEvent
  ) => {
    event.preventDefault();
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <Formik
      initialValues={{
        email: 'admin@supermarket.com',
        password: 'Admin@123',
        submit: null
      }}

      // =====================================================
      // VALIDATION
      // =====================================================

      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Must be a valid email')
          .max(255)
          .required('Email is required'),

        password: Yup.string()
          .required('Password is required')
          .test(
            'no-leading-trailing-whitespace',
            'Password cannot start or end with spaces',
            (value) =>
              value === value?.trim()
          )
          .max(
            100,
            'Password is too long'
          )
      })}

      // =====================================================
      // LOGIN
      // =====================================================

      onSubmit={async (
        values,
        {
          setErrors,
          setStatus,
          setSubmitting
        }
      ) => {
        try {
          const email =
            values.email.trim();

          console.log(
            '================================='
          );

          console.log(
            'SUPERMARKET LOGIN'
          );

          console.log(
            'Email:',
            email
          );

          console.log(
            'Calling backend...'
          );

          // =================================================
          // CALL SUPERMARKET JWT LOGIN
          // =================================================

          const response = await login(
            email,
            values.password
          );

          console.log(
            'Login response:',
            response
          );

          console.log(
            'Login successful!'
          );

          // =================================================
          // CHECK TOKEN
          // =================================================

          const token =
            localStorage.getItem(
              'token'
            );

          console.log(
            'Token saved:',
            !!token
          );

          // =================================================
          // CHECK USER
          // =================================================

          const user =
            localStorage.getItem(
              'user'
            );

          console.log(
            'User saved:',
            user
          );

          // =================================================
          // SET SUCCESS
          // =================================================

          if (scriptedRef.current) {
            setStatus({
              success: true
            });

            setSubmitting(false);
          }

          // =================================================
          // NAVIGATE TO DASHBOARD
          // =================================================

          console.log(
            'Navigating to dashboard...'
          );

          navigate(
            '/dashboard/default',
            {
              replace: true
            }
          );

          console.log(
            '================================='
          );

        } catch (err: any) {
          console.error(
            '================================='
          );

          console.error(
            'SUPERMARKET LOGIN ERROR'
          );

          console.error(err);

          console.error(
            '================================='
          );

          if (scriptedRef.current) {
            setStatus({
              success: false
            });

            setErrors({
              submit:
                err?.message ||
                'Invalid email or password'
            });

            setSubmitting(false);
          }
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form
          noValidate
          onSubmit={handleSubmit}
        >
          <Grid container spacing={3}>

            {/* =================================================
                EMAIL
            ================================================= */}

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>

                <InputLabel htmlFor="email-login">
                  Email Address
                </InputLabel>

                <OutlinedInput
                  id="email-login"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  fullWidth
                  error={Boolean(
                    touched.email &&
                    errors.email
                  )}
                />

              </Stack>

              {touched.email &&
                errors.email && (
                  <FormHelperText error>
                    {errors.email}
                  </FormHelperText>
                )}
            </Grid>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>

                <InputLabel htmlFor="password-login">
                  Password
                </InputLabel>

                <OutlinedInput
                  fullWidth
                  id="password-login"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    values.password
                  }
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter password"

                  error={Boolean(
                    touched.password &&
                    errors.password
                  )}

                  endAdornment={
                    <InputAdornment position="end">

                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={
                          handleClickShowPassword
                        }
                        onMouseDown={
                          handleMouseDownPassword
                        }
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? (
                          <Eye />
                        ) : (
                          <EyeSlash />
                        )}
                      </IconButton>

                    </InputAdornment>
                  }
                />

              </Stack>

              {touched.password &&
                errors.password && (
                  <FormHelperText error>
                    {errors.password}
                  </FormHelperText>
                )}
            </Grid>

            {/* =================================================
                KEEP SIGNED IN / FORGOT PASSWORD
            ================================================= */}

            <Grid
              sx={{ mt: -1 }}
              size={12}
            >
              <Stack
                direction="row"
                sx={{
                  gap: 2,
                  justifyContent:
                    'space-between',
                  alignItems: 'center'
                }}
              >

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) =>
                        setChecked(
                          event.target.checked
                        )
                      }
                      name="checked"
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="h6">
                      Keep me sign in
                    </Typography>
                  }
                />

                <Link
                  variant="h6"
                  component={RouterLink}
                  to={
                    isLoggedIn &&
                    forgot
                      ? forgot
                      : '/forgot-password'
                  }
                  color="text.primary"
                >
                  Forgot Password?
                </Link>

              </Stack>
            </Grid>

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errors.submit && (
              <Grid size={12}>

                <FormHelperText error>
                  {errors.submit}
                </FormHelperText>

              </Grid>
            )}

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <Grid size={12}>

              <AnimateButton>

                <Button
                  disableElevation
                  disabled={
                    isSubmitting
                  }
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Login
                </Button>

              </AnimateButton>

            </Grid>

          </Grid>
        </form>
      )}
    </Formik>
  );
}