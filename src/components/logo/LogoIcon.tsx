
import { Box, Typography } from '@mui/material';

export default function LogoIcon() {
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: 22, fontWeight: 800, color: 'inherit' }}
      >
        S
      </Typography>
    </Box>
  );
}
