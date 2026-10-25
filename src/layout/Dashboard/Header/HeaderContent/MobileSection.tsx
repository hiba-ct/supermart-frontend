
import { useEffect, useRef, useState } from 'react';

// Material UI
import AppBar from '@mui/material/AppBar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Project imports
import Localization from './Localization';
import Profile from './Profile';
import Search from './Search';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// Assets
import { MoreSquare } from 'iconsax-reactjs';

// ==============================|| SUPERMART MOBILE HEADER ||============================== //

export default function MobileSection() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const prevOpen = useRef(open);

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

  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          aria-label="Open SuperMart mobile menu"
          aria-controls={open ? 'supermart-mobile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open}
          ref={anchorRef}
          onClick={handleToggle}
          color="secondary"
          variant="light"
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', {
              bgcolor: open
                ? 'background.paper'
                : 'background.default'
            })
          })}
        >
          <MoreSquare
            variant="Bulk"
            style={{ transform: 'rotate(90deg)' }}
          />
        </IconButton>
      </Box>

      <Popper
        id="supermart-mobile-menu"
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{
          width: 'min(420px, calc(100vw - 24px))',
          zIndex: 1300
        }}
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 9] }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="fade"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                borderRadius: 2,
                overflow: 'hidden'
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <AppBar
                  color="inherit"
                  position="static"
                  elevation={0}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  {/* Supermarket mobile header */}
                  <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography
                      variant="h5"
                      color="text.primary"
                    >
                      SuperMart
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Retail Management
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ px: 1.5, pb: 2 }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Search />
                    </Box>

                    <Localization />

                    <Profile />
                  </Stack>
                </AppBar>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}
