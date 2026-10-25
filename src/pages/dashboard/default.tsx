import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import { GRID_COMMON_SPACING } from 'config';
import EcommerceDataCard from 'components/cards/statistics/EcommerceDataCard';
import EcommerceDataChart from 'sections/widget/chart/EcommerceDataChart';
import { getDashboardStatsAPI } from '../../api/dashboardApi';
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

interface LowStockProduct {
  _id: string;
  name: string;
  sku?: string;
  stock?: number | string;
  quantity?: number | string;
  lowStockThreshold?: number | string;
  threshold?: number | string;
  isActive?: boolean;
}

const emptyStats: DashboardStats = {
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

const extractProducts = (response: any): LowStockProduct[] => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.products,
    response?.data?.products,
    response?.data?.data,
    response?.data
  ];

  return candidates.find(Array.isArray) ?? [];
};

export default function DashboardDefault() {
  const theme = useTheme();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] =
    useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardResponse, productsResponse] = await Promise.all([
          getDashboardStatsAPI(),
          getProductsAPI()
        ]);

        if (dashboardResponse?.success === false) {
          throw new Error(
            dashboardResponse?.message ||
              'Unable to load supermarket dashboard.'
          );
        }

        const dashboardData =
          dashboardResponse?.stats ??
          dashboardResponse?.data?.stats ??
          dashboardResponse?.data ??
          dashboardResponse ??
          {};

        const products = extractProducts(productsResponse);

        // Match the Inventory page: compare each product's stock to its threshold.
        const lowStock = products.filter((product) => {
          const stock = Number(product.stock ?? product.quantity ?? 0);
          const threshold = Number(
            product.lowStockThreshold ?? product.threshold ?? 10
          );

          return stock <= threshold;
        });

        const mergedStats: DashboardStats = {
          ...emptyStats,
          ...dashboardData,
          totalProducts:
            products.length || Number(dashboardData?.totalProducts ?? 0),
          lowStockCount: lowStock.length
        };

        if (isMounted) {
          setStats(mergedStats);
          setLowStockProducts(lowStock);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load supermarket dashboard.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatOMR = (amount: number | undefined) =>
    `OMR ${Number(amount || 0).toFixed(3)}`;

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress />
        <Typography>Loading supermart dashboard...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={GRID_COMMON_SPACING}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Monitor sales, refunds and inventory at a glance.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {stats && (
        <>
          <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Total Products"
                count={String(stats.totalProducts ?? 0)}
                percentage={
                  <Typography color="primary">Product inventory</Typography>
                }
                iconPrimary={<Inventory2OutlinedIcon />}
              >
                <EcommerceDataChart color={theme.palette.primary.main} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Low Stock Products"
                count={String(stats.lowStockCount ?? 0)}
                percentage={
                  <Typography color="warning.dark">Stock alerts</Typography>
                }
                color="warning"
                iconPrimary={<WarningAmberOutlinedIcon />}
              >
                <EcommerceDataChart color={theme.palette.warning.dark} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Today's Gross Sales"
                count={formatOMR(stats.todaySales)}
                color="success"
                iconPrimary={<PointOfSaleOutlinedIcon />}
                percentage={
                  <Typography color="success.main">Before refunds</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.success.main} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Total Gross Sales"
                count={formatOMR(stats.totalSales)}
                iconPrimary={<ReceiptLongOutlinedIcon />}
                percentage={
                  <Typography color="primary">All-time sales</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.primary.main} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Today's Refunds"
                count={formatOMR(stats.todayRefunds)}
                color="warning"
                iconPrimary={<ReplayOutlinedIcon />}
                percentage={
                  <Typography color="warning.dark">Completed returns</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.warning.dark} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Total Refunds"
                count={formatOMR(stats.totalRefunds)}
                color="error"
                iconPrimary={<ReplayOutlinedIcon />}
                percentage={
                  <Typography color="error.main">All-time refunds</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.error.main} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="Today's Net Sales"
                count={formatOMR(stats.todayNetSales)}
                color="success"
                iconPrimary={<AccountBalanceWalletOutlinedIcon />}
                percentage={
                  <Typography color="success.main">Sales minus refunds</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.success.main} />
              </EcommerceDataCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <EcommerceDataCard
                title="All-Time Net Sales"
                count={formatOMR(stats.netSales)}
                color="success"
                iconPrimary={<AccountBalanceWalletOutlinedIcon />}
                percentage={
                  <Typography color="success.main">After refunds</Typography>
                }
              >
                <EcommerceDataChart color={theme.palette.success.main} />
              </EcommerceDataCard>
            </Grid>
          </Grid>

          <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    Sales Summary
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Total transactions
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {stats.totalTransactions ?? 0}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Completed returns
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {stats.totalReturns ?? 0}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Total refunds
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    color="error.main"
                  >
                    {formatOMR(stats.totalRefunds)}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Net sales
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    color="success.main"
                  >
                    {formatOMR(stats.netSales)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Low Stock Alerts
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell align="right">Available Stock</TableCell>
                          <TableCell align="right">Threshold</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {lowStockProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No low-stock products
                            </TableCell>
                          </TableRow>
                        ) : (
                          lowStockProducts.map((product) => (
                            <TableRow key={product._id} hover>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.sku || '-'}</TableCell>
                              <TableCell align="right">
                                <Typography color="warning.main">
                                  {product.stock ?? product.quantity ?? 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {product.lowStockThreshold ??
                                  product.threshold ??
                                  10}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
