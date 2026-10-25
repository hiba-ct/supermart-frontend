
import { Box, Typography } from '@mui/material';
import { Shop } from 'iconsax-reactjs';

export default function LogoMain() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        py: 0.5
      }}
    >
      <Shop
        size={30}
        variant="Bold"
        color="#6C5CE7"
      />

      <Typography
        component="span"
        sx={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '0.3px',
          color: 'primary.main',
          whiteSpace: 'nowrap'
        }}
      >
        SuperMart
      </Typography>
    </Box>
  );
}
