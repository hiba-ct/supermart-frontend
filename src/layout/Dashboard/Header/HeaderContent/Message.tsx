
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

// Project imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { NotificationStatus, Add } from 'iconsax-reactjs';

// ==============================|| SUPERMARKET QUICK PANEL ||============================== //

export default function Customization() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setOpen((previous) => !previous);
  };

  const openPage = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          color="secondary"
          variant="light"
          onClick={handleToggle}
          aria-label="Open supermarket quick panel"
          aria-expanded={open}
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', {
              bgcolor: open ? 'background.paper' : 'background.default'
            })
          })}
        >
          <NotificationStatus variant="Bulk" />
        </IconButton>
      </Box>

      <Drawer
        sx={{ zIndex: 2001 }}
        anchor="right"
        onClose={handleToggle}
        open={open}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 420 },
              maxWidth: '100%'
            }
          }
        }}
      >
        {open && (
          <MainCard
            content={false}
            sx={{
              border: 'none',
              borderRadius: 0,
              minHeight: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ p: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="h4">
                    SuperMart Quick Panel
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Your supermarket at a glance
                  </Typography>
                </Box>

                <IconButton
                  color="secondary"
                  onClick={handleToggle}
                  aria-label="Close quick panel"
                >
                  <Add
                    size={26}
                    style={{ transform: 'rotate(45deg)' }}
                  />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Quick Access
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openPage('/supermarket/products')}
                    sx={{ py: 1.5 }}
                  >
                    Products
                  </Button>
                </Grid>

                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openPage('/supermarket/inventory')}
                    sx={{ py: 1.5 }}
                  >
                    Inventory
                  </Button>
                </Grid>

                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openPage('/supermarket/purchases')}
                    sx={{ py: 1.5 }}
                  >
                    Purchases
                  </Button>
                </Grid>

                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => openPage('/supermarket/sales')}
                    sx={{ py: 1.5 }}
                  >
                    New Sale / POS
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5" sx={{ mb: 1 }}>
                Business Management
              </Typography>

              <Stack spacing={1}>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => openPage('/supermarket/suppliers')}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                >
                  Suppliers
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => openPage('/supermarket/reports')}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                >
                  Sales & Business Reports
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => openPage('/supermarket/employees')}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                >
                  Employee Management
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => openPage('/supermarket/attendance')}
                  sx={{ justifyContent: 'flex-start', py: 1 }}
                >
                  Daily Attendance
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover'
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Stock & Expiry Monitoring
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, mb: 1.5 }}
                >
                  Review stock levels and product expiry dates in Inventory.
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => openPage('/supermarket/inventory')}
                >
                  Check Inventory
                </Button>
              </Box>
            </Box>
          </MainCard>
        )}
      </Drawer>
    </>
  );
}
