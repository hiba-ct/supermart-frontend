
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const features = [
  {
    title: 'Product Management',
    description:
      'Add, update and organize products with categories and pricing.',
    icon: <Inventory2OutlinedIcon />,
    color: '#6554F0',
    background: '#EFEDFF'
  },
  {
    title: 'Sales & POS',
    description:
      'Manage sales transactions and make billing easier.',
    icon: <PointOfSaleOutlinedIcon />,
    color: '#1976D2',
    background: '#E8F3FF'
  },
  {
    title: 'Inventory Tracking',
    description:
      'Monitor stock levels and identify low-stock products.',
    icon: <LocalShippingOutlinedIcon />,
    color: '#16A765',
    background: '#E5F8EE'
  },
  {
    title: 'Business Reports',
    description:
      'Review sales, purchases and inventory information.',
    icon: <AssessmentOutlinedIcon />,
    color: '#E88A22',
    background: '#FFF2E2'
  }
];

const technologies = [
  'React',
  'TypeScript',
  'Material UI',
  'Node.js',
  'Express.js',
  'MongoDB'
];

export default function SuperMartHome() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F7F8FC',
        color: '#17243B',
        overflowX: 'hidden'
      }}
    >
      {/* SEO-friendly page heading and navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          color: '#17243B',
          borderBottom: '1px solid #E9ECF4'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 76,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ShoppingCartOutlinedIcon
                sx={{ fontSize: 35, color: '#6554F0' }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: '#17243B'
                }}
              >
                Super
                <Box component="span" sx={{ color: '#6554F0' }}>
                  Mart
                </Box>
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 1, md: 3 }}
              alignItems="center"
            >
              <Button
                href="#features"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#34415B'
                }}
              >
                Features
              </Button>

              <Button
                href="#about"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#34415B'
                }}
              >
                About
              </Button>

              <Button
                variant="contained"
                startIcon={<GitHubIcon />}
                href="https://github.com/hiba-ct"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: '#6554F0',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2.5 },
                  '&:hover': { bgcolor: '#5040D4' }
                }}
              >
                View GitHub
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero section */}
      <Box
        sx={{
          background:
            'radial-gradient(ellipse at 90% 10%, #E9E8FF 0%, transparent 35%), linear-gradient(135deg, #FFFFFF 0%, #F3F4FF 100%)',
          py: { xs: 6, md: 9 }
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1.05fr 0.95fr'
              },
              alignItems: 'center',
              gap: { xs: 5, md: 7 }
            }}
          >
            <Box>
              <Typography
                component="p"
                sx={{
                  color: '#6554F0',
                  fontWeight: 800,
                  letterSpacing: 2,
                  fontSize: 13,
                  mb: 2
                }}
              >
                RETAIL BUSINESS MANAGEMENT
              </Typography>

              <Typography
                component="h1"
                sx={{
                  color: '#17243B',
                  fontSize: {
                    xs: '2.35rem',
                    sm: '3rem',
                    lg: '3.65rem'
                  },
                  fontWeight: 900,
                  letterSpacing: '-1.8px',
                  lineHeight: 1.12,
                  mb: 3
                }}
              >
                Run Your Supermarket Smarter with{' '}
                <Box component="span" sx={{ color: '#6554F0' }}>
                  SuperMart
                </Box>
              </Typography>

              <Typography
                component="p"
                sx={{
                  color: '#586781',
                  fontSize: { xs: '1rem', md: '1.12rem' },
                  lineHeight: 1.9,
                  maxWidth: 610,
                  mb: 4
                }}
              >
                A retail management system designed to organize
                products, inventory, suppliers, purchases and sales
                in one place. Simple, practical and built for modern
                supermarket operations.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
              >
                <Button
                  href="#features"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    bgcolor: '#6554F0',
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#5040D4' }
                  }}
                >
                  Explore Features
                </Button>

                <Button
                  href="https://github.com/hiba-ct"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="large"
                  startIcon={<GitHubIcon />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    borderColor: '#6554F0',
                    color: '#6554F0',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  View Source Code
                </Button>
              </Stack>

              <Typography
                sx={{ mt: 3, fontSize: 13, color: '#748099' }}
              >
                Built with modern web technologies
              </Typography>
            </Box>

            {/* Dashboard illustration made with MUI */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                border: '1px solid #E7E9F5',
                boxShadow: '0 24px 65px rgba(40, 48, 100, 0.12)',
                bgcolor: '#FFFFFF'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShoppingCartOutlinedIcon
                    sx={{ color: '#6554F0', fontSize: 28 }}
                  />
                  <Typography fontWeight={800} color="#17243B">
                    SuperMart
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#6554F0',
                    bgcolor: '#EFEDFF',
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 2
                  }}
                >
                  Dashboard Preview
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 2
                }}
              >
                {[
                  {
                    label: 'Products',
                    value: 'Management',
                    icon: <Inventory2OutlinedIcon />,
                    color: '#6554F0'
                  },
                  {
                    label: 'Sales',
                    value: '& POS',
                    icon: <PointOfSaleOutlinedIcon />,
                    color: '#1976D2'
                  },
                  {
                    label: 'Stock',
                    value: 'Monitoring',
                    icon: <LocalShippingOutlinedIcon />,
                    color: '#16A765'
                  },
                  {
                    label: 'Business',
                    value: 'Reports',
                    icon: <AssessmentOutlinedIcon />,
                    color: '#E88A22'
                  }
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 2,
                      minHeight: 115,
                      bgcolor: '#FAFBFF',
                      border: '1px solid #EDF0F7',
                      borderRadius: 3
                    }}
                  >
                    <Box sx={{ color: item.color, mb: 1 }}>
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{ color: '#718099', fontSize: 12 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#17243B',
                        fontWeight: 800,
                        fontSize: { xs: 15, sm: 18 }
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: '#F7F8FC',
                  borderRadius: 3
                }}
              >
                <Typography
                  sx={{ fontWeight: 800, mb: 2, color: '#17243B' }}
                >
                  Retail Operations
                </Typography>

                {[
                  { label: 'Products & Categories', width: '90%' },
                  { label: 'Inventory & Suppliers', width: '75%' },
                  { label: 'Sales & Reporting', width: '82%' }
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 1.5 }}>
                    <Typography
                      sx={{ color: '#586781', fontSize: 12, mb: 0.7 }}
                    >
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        height: 7,
                        bgcolor: '#E6E8F4',
                        borderRadius: 5,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: item.width,
                          bgcolor: '#6554F0',
                          borderRadius: 5
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              <Typography
                sx={{
                  mt: 2,
                  color: '#8791A6',
                  fontSize: 11,
                  textAlign: 'center'
                }}
              >
                Illustrative preview — not live business data
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box id="features" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <Typography
            component="h2"
            sx={{
              textAlign: 'center',
              fontSize: { xs: '1.9rem', md: '2.5rem' },
              fontWeight: 900,
              color: '#17243B'
            }}
          >
            Everything You Need to Manage Your Store
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              mb: 5,
              textAlign: 'center',
              color: '#65738B',
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.8
            }}
          >
            Explore the tools designed to help organize daily
            supermarket operations.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))'
              },
              gap: 3
            }}
          >
            {features.map((feature) => (
              <Paper
                key={feature.title}
                elevation={0}
                sx={{
                  p: 3.5,
                  minHeight: 225,
                  borderRadius: 4,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E8EBF3',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 16px 35px rgba(35, 45, 90, 0.09)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    bgcolor: feature.background,
                    color: feature.color,
                    mb: 3,
                    '& svg': { fontSize: 30 }
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography
                  component="h3"
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#17243B',
                    mb: 1.5
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    color: '#65738B',
                    lineHeight: 1.8,
                    fontSize: 14
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* About and technologies */}
      <Box id="about" sx={{ bgcolor: '#FFFFFF', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '1.8rem', md: '2.3rem' },
              fontWeight: 900,
              textAlign: 'center',
              color: '#17243B'
            }}
          >
            About the SuperMart Project
          </Typography>

          <Typography
            sx={{
              maxWidth: 760,
              mx: 'auto',
              mt: 2,
              mb: 4,
              textAlign: 'center',
              color: '#65738B',
              lineHeight: 1.9
            }}
          >
            SuperMart is a retail business management project
            designed to bring essential supermarket operations into
            one application. The system focuses on product
            organization, stock visibility, sales workflows and
            business reporting.
          </Typography>

          <Typography
            component="h3"
            sx={{
              textAlign: 'center',
              color: '#17243B',
              fontWeight: 800,
              mb: 2
            }}
          >
            Technologies Used
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1.5}
          >
            {technologies.map((technology) => (
              <Box
                key={technology}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: '#F0EEFF',
                  color: '#5545D7',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                {technology}
              </Box>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              href="https://my-portfolio-alpha-lyart-12.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#6554F0',
                py: 1.3,
                px: 3,
                textTransform: 'none',
                fontWeight: 700
              }}
            >
              Visit My Portfolio
            </Button>

            <Button
              variant="outlined"
              href="https://github.com/hiba-ct"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                py: 1.3,
                px: 3,
                textTransform: 'none',
                fontWeight: 700
              }}
            >
              Explore GitHub
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          bgcolor: '#17243B',
          color: '#D9DFEC',
          textAlign: 'center'
        }}
      >
        <Typography sx={{ fontSize: 13 }}>
          © {new Date().getFullYear()} SuperMart Retail Management
          System. Built with React and the MERN stack.
        </Typography>
      </Box>
    </Box>
  );
}
