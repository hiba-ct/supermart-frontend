
import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { GRID_COMMON_SPACING } from 'config';

import { getSalesAPI } from '../../api/salesApi';
import { getProductsAPI } from '../../api/productApi';
import { getSalesReturnsAPI } from '../../api/salesReturnApi';

type ReportType = 'sales' | 'inventory' | 'returns';

interface Sale {
  _id: string;
  invoiceNumber?: string;
  createdAt?: string;
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
    subtotal?: number;
  }>;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category?: string | { name?: string };
  brand?: string;
  sellingPrice?: number;
  purchasePrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  unit?: string;
  isActive?: boolean;
}

interface SalesReturn {
  _id: string;
  returnNumber?: string;
  invoiceNumber?: string;
  createdAt?: string;
  refundAmount?: number;
  refundMethod?: string;
  reason?: string;
  status?: string;
  items?: Array<{
    productName?: string;
    quantity?: number;
    price?: number;
    subtotal?: number;
  }>;
}

const formatOMR = (value: unknown) =>
  `OMR ${Number(value || 0).toFixed(3)}`;

const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString();
};

const getRecords = (response: any, key: string): any[] => {
  const body = response?.data ?? response;

  const result =
    body?.[key] ??
    body?.data?.[key];

  return Array.isArray(result) ? result : [];
};

const csvCell = (value: unknown) => {
  let text = String(value ?? '');

  // Prevent spreadsheet formula injection for text values.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCSV = (
  filename: string,
  headers: string[],
  rows: unknown[][]
) => {
  const content = [
    headers,
    ...rows
  ]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');

  const blob = new Blob(
    ['\uFEFF', content],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

export default function SupermarketReports() {
  const [reportType, setReportType] =
    useState<ReportType>('sales');

  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [returns, setReturns] = useState<SalesReturn[]>([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');

        const [salesResponse, productsResponse, returnsResponse] =
          await Promise.all([
            getSalesAPI(),
            getProductsAPI(),
            getSalesReturnsAPI()
          ]);

        if (!active) return;

        setSales(getRecords(salesResponse, 'sales'));
        setProducts(getRecords(productsResponse, 'products'));
        setReturns(getRecords(returnsResponse, 'salesReturns'));
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load reports.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const dateMatches = (dateValue?: string) => {
    if (!startDate && !endDate) return true;
    if (!dateValue) return false;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return false;

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (date < start) return false;
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);
      if (date > end) return false;
    }

    return true;
  };

  const filteredSales = useMemo(
    () => sales.filter((sale) => dateMatches(sale.createdAt)),
    [sales, startDate, endDate]
  );

  const filteredReturns = useMemo(
    () => returns.filter((item) => dateMatches(item.createdAt)),
    [returns, startDate, endDate]
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock ?? 0) <=
      Number(product.lowStockThreshold ?? 10)
  ).length;

  const salesTotal = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.total ?? 0),
    0
  );

  const refundTotal = filteredReturns
    .filter((item) => item.status === 'Completed')
    .reduce(
      (sum, item) => sum + Number(item.refundAmount ?? 0),
      0
    );

  const reportTitle = {
    sales: 'Sales Report',
    inventory: 'Inventory Report',
    returns: 'Sales Returns Report'
  }[reportType];

  const handleExport = () => {
    const suffix = new Date().toISOString().slice(0, 10);

    if (reportType === 'sales') {
      downloadCSV(
        `sales-report-${suffix}.csv`,
        [
          'Invoice Number',
          'Date',
          'Payment Method',
          'Subtotal',
          'Tax',
          'Total (OMR)'
        ],
        filteredSales.map((sale) => [
          sale.invoiceNumber || sale._id,
          sale.createdAt || '',
          sale.paymentMethod || '',
          Number(sale.subtotal ?? 0).toFixed(3),
          Number(sale.tax ?? 0).toFixed(3),
          Number(sale.total ?? 0).toFixed(3)
        ])
      );
    } else if (reportType === 'inventory') {
      downloadCSV(
        `inventory-report-${suffix}.csv`,
        [
          'Product',
          'SKU',
          'Barcode',
          'Category',
          'Brand',
          'Purchase Price (OMR)',
          'Selling Price (OMR)',
          'Stock',
          'Unit',
          'Low Stock Status',
          'Active'
        ],
        products.map((product) => {
          const stock = Number(product.stock ?? 0);
          const threshold = Number(
            product.lowStockThreshold ?? 10
          );

          const category =
            typeof product.category === 'object'
              ? product.category?.name
              : product.category;

          return [
            product.name,
            product.sku || '',
            product.barcode || '',
            category || '',
            product.brand || '',
            Number(product.purchasePrice ?? 0).toFixed(3),
            Number(product.sellingPrice ?? 0).toFixed(3),
            stock,
            product.unit || '',
            stock <= threshold ? 'Low Stock' : 'In Stock',
            product.isActive === false ? 'No' : 'Yes'
          ];
        })
      );
    } else {
      downloadCSV(
        `sales-returns-report-${suffix}.csv`,
        [
          'Return Number',
          'Invoice Number',
          'Date',
          'Reason',
          'Refund Method',
          'Refund Amount (OMR)',
          'Status'
        ],
        filteredReturns.map((item) => [
          item.returnNumber || item._id,
          item.invoiceNumber || '',
          item.createdAt || '',
          item.reason || '',
          item.refundMethod || '',
          Number(item.refundAmount ?? 0).toFixed(3),
          item.status || ''
        ])
      );
    }
  };

  const recordCount =
    reportType === 'sales'
      ? filteredSales.length
      : reportType === 'inventory'
        ? products.length
        : filteredReturns.length;

  return (
    <Stack spacing={GRID_COMMON_SPACING}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Reports & Export
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Generate supermarket sales, inventory and returns reports.
          Export your records to CSV for Excel.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading report data...
          </Typography>
        </Stack>
      ) : (
        <>
          <Grid container spacing={GRID_COMMON_SPACING}>
            {[
              {
                label: 'Sales Total',
                value: formatOMR(salesTotal)
              },
              {
                label: 'Completed Refunds',
                value: formatOMR(refundTotal)
              },
              {
                label: 'Products',
                value: products.length.toLocaleString()
              },
              {
                label: 'Low Stock Products',
                value: lowStockCount.toLocaleString()
              }
            ].map((item) => (
              <Grid
                key={item.label}
                size={{ xs: 12, sm: 6, lg: 3 }}
              >
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AssessmentOutlinedIcon color="primary" />
                <Typography variant="h5" fontWeight={600}>
                  Generate Report
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Report Type"
                    value={reportType}
                    onChange={(event) =>
                      setReportType(event.target.value as ReportType)
                    }
                  >
                    <MenuItem value="sales">Sales Report</MenuItem>
                    <MenuItem value="inventory">Inventory Report</MenuItem>
                    <MenuItem value="returns">Sales Returns Report</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Start Date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="End Date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid
                  size={{ xs: 12, md: 2 }}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={handleExport}
                    disabled={
                      (reportType === 'sales' && filteredSales.length === 0) ||
                      (reportType === 'inventory' && products.length === 0) ||
                      (reportType === 'returns' && filteredReturns.length === 0)
                    }
                  >
                    Export CSV
                  </Button>
                </Grid>
              </Grid>

              {startDate && endDate && startDate > endDate && (
                <Alert severity="warning">
                  Start date must be on or before the end date.
                </Alert>
              )}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography variant="h6">
                  {reportTitle}
                </Typography>

                <Chip
                  label={`${recordCount} records`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              {reportType === 'sales' && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No sales found for the selected dates.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSales.map((sale) => (
                          <TableRow key={sale._id}>
                            <TableCell>
                              {sale.invoiceNumber || sale._id}
                            </TableCell>
                            <TableCell>
                              {formatDate(sale.createdAt)}
                            </TableCell>
                            <TableCell>
                              {sale.paymentMethod || '—'}
                            </TableCell>
                            <TableCell align="right">
                              {formatOMR(sale.total ?? 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {reportType === 'inventory' && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Selling Price</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No products found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => {
                          const stock = Number(product.stock ?? 0);
                          const threshold = Number(
                            product.lowStockThreshold ?? 10
                          );
                          const lowStock = stock <= threshold;

                          return (
                            <TableRow key={product._id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.sku || '—'}</TableCell>
                              <TableCell align="right">{stock}</TableCell>
                              <TableCell align="right">
                                {formatOMR(product.sellingPrice ?? 0)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={lowStock ? 'Low Stock' : 'In Stock'}
                                  color={lowStock ? 'warning' : 'success'}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {reportType === 'returns' && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Return Number</TableCell>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Refund</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReturns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No returns found for the selected dates.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReturns.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              {item.returnNumber || item._id}
                            </TableCell>
                            <TableCell>
                              {item.invoiceNumber || '—'}
                            </TableCell>
                            <TableCell>
                              {formatDate(item.createdAt)}
                            </TableCell>
                            <TableCell align="right">
                              {formatOMR(item.refundAmount ?? 0)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={item.status || 'Unknown'}
                                color={
                                  item.status === 'Completed'
                                    ? 'success'
                                    : 'default'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Typography variant="body2" color="text.secondary">
                CSV exports contain the records for the selected report.
                Inventory is a current-stock snapshot and is not filtered by
                transaction date.
              </Typography>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
