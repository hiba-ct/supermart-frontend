
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 3,
        pb: 1,
        px: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14
            }}
          >
            S
          </Box>

          <Typography variant="body2" fontWeight={600}>
            SuperMart
          </Typography>

          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} All rights reserved.
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
        >
          Retail Business Management Platform
        </Typography>
      </Stack>
    </Box>
  );
}
