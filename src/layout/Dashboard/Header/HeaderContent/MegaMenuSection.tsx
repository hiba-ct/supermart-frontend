
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Material UI
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Project imports
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

// Icons
import { Windows } from 'iconsax-reactjs';

// ==============================|| SUPERMARKET QUICK MENU ||============================== //

const menuGroups = [
  {
    title: 'Product Management',
    items: [
      { label: 'Products', path: '/supermarket/products' },
      { label: 'Categories', path: '/supermarket/categories' },
      { label: 'Inventory', path: '/supermarket/inventory' }
    ]
  },
  {
    title: 'Purchasing & Sales',
    items: [
      { label: 'Suppliers', path: '/supermarket/suppliers' },
      { label: 'Purchases', path: '/supermarket/purchases' },
      { label: 'Sales / POS', path: '/supermarket/sales' },
      { label: 'Sales Returns', path: '/supermarket/sales-returns' }
    ]
  },
  {
    title: 'Business Operations',
    items: [
      { label: 'Reports', path: '/supermarket/reports' },
      { label: 'Employees', path: '/supermarket/employees' },
      { label: 'Attendance', path: '/supermarket/attendance' }
    ]
  }
];

export default function MegaMenuSection() {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((previous) => !previous);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      event.target instanceof Node &&
      anchorRef.current.contains(event.target)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="Open supermarket quick menu"
        ref={anchorRef}
        aria-controls={open ? 'supermarket-quick-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleToggle}
        size="large"
        sx={(theme) => ({
          p: 1,
          ml: { xs: 0, lg: -2 },
          color: 'secondary.main',
          bgcolor: open ? 'secondary.200' : 'secondary.100',
          ...theme.applyStyles('dark', {
            bgcolor: open ? 'background.paper' : 'background.default'
          })
        })}
      >
        <Windows variant="Bulk" />
      </IconButton>

      <Popper
        id="supermarket-quick-menu"
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: { offset: [-180, 9] }
            }
          ]
        }}
        sx={{
          zIndex: 1300,
          maxWidth: 'calc(100vw - 16px)'
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position="top"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                width: {
                  xs: 'calc(100vw - 32px)',
                  sm: 680,
                  md: 850
                },
                maxWidth: 'calc(100vw - 32px)',
                borderRadius: 2,
                overflow: 'hidden'
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  elevation={0}
                  border={false}
                  content={false}
                >
                  {/* Menu heading */}
                  <Box
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 2.5,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText'
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                      SuperMart Quick Access
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Manage your supermarket operations from one place.
                    </Typography>
                  </Box>

                  {/* Menu groups */}
                  <Grid
                    container
                    spacing={2}
                    sx={{ p: { xs: 2, sm: 3 } }}
                  >
                    {menuGroups.map((group) => (
                      <Grid
                        key={group.title}
                        size={{ xs: 12, sm: 4 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: 'text.primary'
                          }}
                        >
                          {group.title}
                        </Typography>

                        <List
                          component="nav"
                          disablePadding
                          aria-label={group.title}
                          sx={{
                            '& .MuiListItemButton-root': {
                              borderRadius: 1.5,
                              mb: 0.5,
                              px: 1,
                              py: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                '& .MuiTypography-root': {
                                  color: 'primary.main'
                                }
                              }
                            },
                            '& .MuiListItemIcon-root': {
                              minWidth: 22
                            }
                          }}
                        >
                          {group.items.map((item) => (
                            <ListItemButton
                              key={item.path}
                              component={Link}
                              to={item.path}
                              onClick={() => setOpen(false)}
                            >
                              <ListItemIcon>
                                <Dot
                                  size={7}
                                  color="secondary"
                                  variant="filled"
                                />
                              </ListItemIcon>

                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {item.label}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Footer */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 1.5,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Supermarket Management System
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Quick Navigation
                    </Typography>
                  </Stack>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
