import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';

import { GRID_COMMON_SPACING } from 'config';
import { getFinanceAPI } from '../../api/dashboardApi';
import { getProductsAPI } from '../../api/productApi';

interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  todaySales: number;
  totalSales: number;
  totalTransactions: number;
  todayRefunds: number;
  totalRefunds: number;
  todayNetSales: number;
  netSales: number;
  totalReturns: number;
  todayReturns: number;
}

interface ProductOption {
  _id?: string;
  name?: string;
  stock?: number | string;
  quantity?: number | string;
  lowStockThreshold?: number | string;
  threshold?: number | string;
  isActive?: boolean;
}

const initialStats: DashboardStats = {
  totalProducts: 0,
  lowStockCount: 0,
  todaySales: 0,
  totalSales: 0,
  totalTransactions: 0,
  todayRefunds: 0,
  totalRefunds: 0,
  todayNetSales: 0,
  netSales: 0,
  totalReturns: 0,
  todayReturns: 0
};

const formatOMR = (amount: number) =>
  `OMR ${Number(amount || 0).toFixed(3)}`;

const extractProducts = (response: any): ProductOption[] => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.products,
    response?.data?.products,
    response?.data?.data,
    response?.data
  ];

  return candidates.find(Array.isArray) ?? [];
};

export default function DashboardFinance() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFinanceData = async () => {
      try {
        setLoading(true);
        setError('');

        const [response, productsResponse] = await Promise.all([
          getFinanceAPI(),
          getProductsAPI()
        ]);

        if (response?.success === false) {
          throw new Error(
            response?.message || 'Unable to load finance statistics.'
          );
        }

        const data =
          response?.stats ??
          response?.data?.stats ??
          response?.data ??
          response;

        const products = extractProducts(productsResponse);

        const lowStockProducts = products.filter((product) => {
          const stock = Number(product.stock ?? product.quantity ?? 0);
          const threshold = Number(
            product.lowStockThreshold ?? product.threshold ?? 10
          );

          return stock <= threshold;
        });

        if (isMounted) {
          setStats({
            ...initialStats,
            ...data,
            totalProducts: products.length || Number(data?.totalProducts ?? 0),
            lowStockCount: lowStockProducts.length
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load finance statistics.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFinanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      title: "Today's Gross Sales",
      value: formatOMR(stats.todaySales),
      description: 'Sales recorded today before refunds',
      icon: <PointOfSaleOutlinedIcon />,
      color: '#2e7d32'
    },
    {
      title: 'Total Gross Sales',
      value: formatOMR(stats.totalSales),
      description: 'All recorded sales before refunds',
      icon: <AccountBalanceWalletOutlinedIcon />,
      color: '#635bdb'
    },
    {
      title: "Today's Refunds",
      value: formatOMR(stats.todayRefunds),
      description: 'Completed refunds recorded today',
      icon: <ReplayOutlinedIcon />,
      color: '#ed6c02'
    },
    {
      title: 'Total Refunds',
      value: formatOMR(stats.totalRefunds),
      description: 'All completed refunds',
      icon: <ReplayOutlinedIcon />,
      color: '#d32f2f'
    },
    {
      title: "Today's Net Sales",
      value: formatOMR(stats.todayNetSales),
      description: "Today's gross sales minus today's refunds",
      icon: <PointOfSaleOutlinedIcon />,
      color: '#0288d1'
    },
    {
      title: 'All-Time Net Sales',
      value: formatOMR(stats.netSales),
      description: 'Gross sales minus completed refunds',
      icon: <AccountBalanceWalletOutlinedIcon />,
      color: '#00897b'
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions.toLocaleString(),
      description: 'Recorded sale transactions',
      icon: <ReceiptLongOutlinedIcon />,
      color: '#6a1b9a'
    },
    {
      title: 'Completed Returns',
      value: stats.totalReturns.toLocaleString(),
      description: `${stats.todayReturns} returns recorded today`,
      icon: <ReplayOutlinedIcon />,
      color: '#795548'
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      description: 'Products in the catalogue',
      icon: <Inventory2OutlinedIcon />,
      color: '#1565c0'
    },
    {
      title: 'Low Stock Products',
      value: stats.lowStockCount.toLocaleString(),
      description: 'Products at or below the stock threshold',
      icon: <WarningAmberOutlinedIcon />,
      color: '#c62828'
    }
  ];

  return (
    <Stack spacing={GRID_COMMON_SPACING}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Finance
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Review sales, refunds, net sales and transaction performance.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading finance data...
          </Typography>
        </Stack>
      ) : !error ? (
        <>
          <Grid container spacing={GRID_COMMON_SPACING}>
            {cards.map((card) => (
              <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                        bgcolor: `${card.color}18`
                      }}
                    >
                      {card.icon}
                    </Box>

                    <Typography color="text.secondary">
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {card.value}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Finance Summary
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Today's Gross Sales
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatOMR(stats.todaySales)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="body2">
                  Today's Refunds
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatOMR(stats.todayRefunds)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="body2">
                  Today's Net Sales
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatOMR(stats.todayNetSales)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" variant="body2">
                  All-Time Net Sales
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatOMR(stats.netSales)}
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mt: 3 }}>
              Net sales are gross sales minus completed refunds. Profit,
              operating expenses, and net income are different calculations
              and require product costs and expense records.
            </Alert>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
