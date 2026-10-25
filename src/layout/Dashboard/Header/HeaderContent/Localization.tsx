
import { useRef, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

import useConfig from 'hooks/useConfig';
import { LanguageSquare } from 'iconsax-reactjs';

import { I18n } from 'types/config';

const languages: {
  code: string;
  label: string;
  nativeLabel: string;
  codeLabel: string;
}[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    codeLabel: 'UK'
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    codeLabel: 'Malayalam'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    codeLabel: 'Hindi'
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    codeLabel: 'Arabic'
  }
];

export default function Localization() {
  const downMD = useMediaQuery((theme) =>
    theme.breakpoints.down('md')
  );

  const { i18n, onChangeLocalization } = useConfig();

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

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

  const handleLanguageChange = (code: string) => {
    // The language must also be registered in Able Pro's
    // I18n type, translation resources and configuration.
    onChangeLocalization(code as I18n);
    setOpen(false);
  };

  const selectedLanguage =
    languages.find((language) => language.code === i18n);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="Choose language"
        ref={anchorRef}
        aria-controls={open ? 'localization-grow' : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
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
        <LanguageSquare variant="Bulk" />
      </IconButton>

      <Popper
        placement={downMD ? 'bottom-start' : 'bottom'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 9] }
            }
          ]
        }}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={downMD ? 'top-right' : 'top'}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                borderRadius: 1.5
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <Box sx={{ p: 1, minWidth: 220 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 1.5, py: 1 }}
                    >
                      Select Language
                    </Typography>

                    <List component="nav" disablePadding>
                      {languages.map((language) => (
                        <ListItemButton
                          key={language.code}
                          selected={i18n === language.code}
                          onClick={() =>
                            handleLanguageChange(language.code)
                          }
                          sx={{ borderRadius: 1, mb: 0.5 }}
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                              >
                                <Typography
                                  variant="body1"
                                  color="text.primary"
                                >
                                  {language.nativeLabel}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {language.codeLabel}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
