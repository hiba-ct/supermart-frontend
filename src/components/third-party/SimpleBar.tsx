
import type { ReactNode, ComponentProps } from 'react';

// Material UI
import { alpha, styled, Theme, useTheme } from '@mui/material/styles';
import { MUIStyledCommonProps } from '@mui/system';
import Box from '@mui/material/Box';

// Project
import { ThemeDirection } from 'config';

// Third-party
import { BrowserView, MobileView } from 'react-device-detect';
import SimpleBar from 'simplebar-react';

// Root style
const RootStyle = styled(BrowserView)({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden'
});

// Scrollbar wrapper
const SimpleBarStyle = styled(SimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.25)
    },
    '&.simplebar-visible:before': {
      opacity: 1
    }
  },
  '& .simplebar-track.simplebar-vertical': {
    width: 10
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 6
  },
  '& .simplebar-mask': {
    zIndex: 'inherit'
  }
}));

// Simple scroll bar
type SimpleBarScrollProps = Omit<
  ComponentProps<typeof SimpleBar>,
  'children'
> &
  MUIStyledCommonProps<Theme> & {
    children?: ReactNode;
  };

export default function SimpleBarScroll({
  children,
  sx,
  ...other
}: SimpleBarScrollProps) {
  const theme = useTheme();

  return (
    <>
      <RootStyle>
        <SimpleBarStyle
          clickOnTrack={false}
          sx={sx}
          data-simplebar-direction={
            theme.direction === ThemeDirection.RTL ? 'rtl' : 'ltr'
          }
          {...other}
        >
          {children}
        </SimpleBarStyle>
      </RootStyle>

      <MobileView>
        <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
          {children}
        </Box>
      </MobileView>
    </>
  );
}
