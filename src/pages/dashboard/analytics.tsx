
import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { GRID_COMMON_SPACING } from 'config';
import { getSalesAPI } from '../../api/salesApi';
import { getProductsAPI } from '../../api/productApi';
import { getSalesReturnsAPI } from '../../api/salesReturnApi';

interface SaleItem {
  product?: string | { _id?: string; name?: string };
  name?: string;
  quantity: number;
  price?: number;
  subtotal?: number;
}

interface Sale {
  _id: string;
  invoiceNumber?: string;
  items?: SaleItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  createdAt?: string;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  stock?: number;
  price?: number;
  sellingPrice?: number;
  lowStockThreshold?: number;
}

interface SalesReturn {
  _id: string;
  returnNumber?: string;
  invoiceNumber?: string;
  refundAmount?: number;
  status?: string;
  createdAt?: string;
}

const formatOMR = (amount: number) =>
  `OMR ${Number(amount || 0).toFixed(3)}`;

const getArray = (response: any, key: string): any[] => {
  const body = response?.data ?? response;
  const result = body?.[key] ?? body?.data?.[key];

  return Array.isArray(result) ? result : [];
};

export default function DashboardAnalytics() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const [salesResponse, productsResponse, returnsResponse] =
          await Promise.all([
            getSalesAPI(),
            getProductsAPI(),
            getSalesReturnsAPI()
          ]);

        const salesData = getArray(salesResponse, 'sales');
        const productsData = getArray(productsResponse, 'products');
        const returnsData = getArray(returnsResponse, 'salesReturns');

        if (isMounted) {
          setSales(salesData);
          setProducts(productsData);
          setSalesReturns(returnsData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load analytics data.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  // Gross sales: sum of original sale totals.
  const grossSales = useMemo(
    () =>
      sales.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
      ),
    [sales]
  );

  // Count only completed returns.
  const completedReturns = useMemo(
    () =>
      salesReturns.filter(
        (item) => item.status === 'Completed'
      ),
    [salesReturns]
  );

  // Total refund amount recorded for completed returns.
  const totalRefunds = useMemo(
    () =>
      completedReturns.reduce(
        (sum, item) => sum + Number(item.refundAmount || 0),
        0
      ),
    [completedReturns]
  );

  // Net sales after subtracting completed refunds.
  const netSales = grossSales - totalRefunds;

  // Low-stock products use each product's configured threshold.
  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => {
        const threshold = Number(product.lowStockThreshold ?? 10);
        return Number(product.stock ?? 0) <= threshold;
      }),
    [products]
  );

  // Payment breakdown is based on original sale totals.
  const paymentData = useMemo(() => {
    const totals: Record<string, number> = {};

    sales.forEach((sale) => {
      const method = (sale.paymentMethod || 'Unknown').toLowerCase();

      totals[method] =
        (totals[method] || 0) + Number(sale.total || 0);
    });

    return Object.entries(totals).map(([method, amount]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      amount: Number(amount.toFixed(3))
    }));
  }, [sales]);

  // Daily gross sales for the most recent 14 calendar dates with sales.
  const dailySalesData = useMemo(() => {
    const totals: Record<string, number> = {};

    sales.forEach((sale) => {
      if (!sale.createdAt) return;

      const date = new Date(sale.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const label = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      totals[label] =
        (totals[label] || 0) + Number(sale.total || 0);
    });

    return Object.entries(totals)
      .map(([date, amount]) => ({
        date,
        amount: Number(amount.toFixed(3))
      }))
      .slice(-14);
  }, [sales]);

  // Best-selling products, sorted by quantity sold.
  const bestSellingProducts = useMemo(() => {
    const totals: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const productId =
          typeof item.product === 'string'
            ? item.product
            : item.product?._id;

        const name =
          item.name ||
          (typeof item.product === 'object'
            ? item.product?.name
            : undefined) ||
          productId ||
          'Unknown product';

        const key = productId || name;
        const quantity = Number(item.quantity || 0);
        const revenue = Number(
          item.subtotal ?? Number(item.price || 0) * quantity
        );

        if (!totals[key]) {
          totals[key] = { name, quantity: 0, revenue: 0 };
        }

        totals[key].quantity += quantity;
        totals[key].revenue += revenue;
      });
    });

    return Object.values(totals)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress />
        <Typography>Loading supermart analytics...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={GRID_COMMON_SPACING}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Analytics
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Sales performance, refunds, payment methods and inventory insights.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && (
        <>
          {/* Summary cards */}
          <Grid container spacing={GRID_COMMON_SPACING}>
            {[
              {
                label: 'Gross Sales',
                value: formatOMR(grossSales)
              },
              {
                label: 'Total Refunds',
                value: formatOMR(totalRefunds)
              },
              {
                label: 'Net Sales',
                value: formatOMR(netSales)
              },
              {
                label: 'Total Transactions',
                value: String(sales.length)
              },
              {
                label: 'Completed Returns',
                value: String(completedReturns.length)
              },
              {
                label: 'Total Products',
                value: String(products.length)
              },
              {
                label: 'Low Stock Products',
                value: String(lowStockProducts.length)
              }
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {item.label}
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ mt: 2, overflowWrap: 'anywhere' }}
                    >
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Sales chart and payment breakdown */}
          <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Gross Sales by Date
                  </Typography>

                  {dailySalesData.length === 0 ? (
                    <Typography color="text.secondary">
                      No dated sales are available yet.
                    </Typography>
                  ) : (
                    <Box sx={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailySalesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [
                              formatOMR(Number(value ?? 0)),
                              'Gross Sales'
                            ]}
                          />
                          <Bar
                            dataKey="amount"
                            name="Gross Sales"
                            fill="#635BDB"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Payment Breakdown
                  </Typography>

                  {paymentData.length === 0 ? (
                    <Typography color="text.secondary">
                      No payment records available.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {paymentData.map((payment) => (
                        <Box key={payment.method}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Typography>{payment.method}</Typography>
                            <Typography fontWeight={600}>
                              {formatOMR(payment.amount)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Best-selling products */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Best-Selling Products
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity Sold</TableCell>
                      <TableCell align="right">Sales Value</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {bestSellingProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No product sales recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bestSellingProducts.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">
                            {product.quantity}
                          </TableCell>
                          <TableCell align="right">
                            {formatOMR(product.revenue)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent completed returns */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Sales Returns
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Return Number</TableCell>
                      <TableCell>Invoice Number</TableCell>
                      <TableCell align="right">Refund Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {completedReturns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No completed returns recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...completedReturns]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt || 0).getTime() -
                            new Date(a.createdAt || 0).getTime()
                        )
                        .slice(0, 5)
                        .map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              {item.returnNumber || item._id}
                            </TableCell>
                            <TableCell>
                              {item.invoiceNumber || '—'}
                            </TableCell>
                            <TableCell align="right">
                              {formatOMR(Number(item.refundAmount || 0))}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status || 'Unknown'}
                                color="success"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Low-stock products */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Low Stock Products
              </Typography>

              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mb: 2 }}
              >
                Products at or below their configured stock threshold.
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Available Stock</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {lowStockProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No low-stock products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lowStockProducts.map((product) => {
                        const stock = Number(product.stock ?? 0);

                        return (
                          <TableRow key={product._id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.sku || '—'}</TableCell>
                            <TableCell align="right">{stock}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={stock <= 5 ? 'Critical' : 'Low Stock'}
                                color={stock <= 5 ? 'error' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
