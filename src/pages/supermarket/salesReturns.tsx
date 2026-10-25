
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import {
  getSalesReturnsAPI,
  createSalesReturnAPI,
  getSaleForReturnAPI,
  type SalesReturn,
  type CreateSalesReturnData,
} from "../../api/salesReturnApi";

type ReturnableItem = {
  product: string;
  productName: string;
  quantity: number;
  returnedQuantity: number;
  remainingQuantity: number;
  price: number;
};

type OriginalSale = {
  invoiceNumber: string;
  createdAt?: string;
  total: number;
  items: ReturnableItem[];
};

type CreatedReturn = {
  returnNumber: string;
  invoiceNumber: string;
  refundAmount: number;
  refundMethod: string;
  reason: string;
  createdAt?: string;
  items?: {
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
};

const SalesReturns = () => {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sale, setSale] = useState<OriginalSale | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [completedReturn, setCompletedReturn] =
    useState<CreatedReturn | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const formatOMR = (amount: number) =>
    `OMR ${Number(amount || 0).toFixed(3)}`;

  // Support either a response body or an Axios response.
  const getPayload = (response: any) =>
    response?.data ?? response;

  // Load saved returns from MongoDB.
  const loadReturns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = getPayload(await getSalesReturnsAPI());

      if (response?.success === false) {
        throw new Error(
          response.message || "Could not load sales returns."
        );
      }

      if (!Array.isArray(response?.salesReturns)) {
        throw new Error(
          "The returns API did not return a salesReturns array. Check your backend response."
        );
      }

      setReturns(response.salesReturns);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load sales returns."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReturns();
  }, []);

  const resetForm = () => {
    setInvoiceNumber("");
    setSale(null);
    setSelectedProduct("");
    setQuantity("1");
    setReason("");
    setRefundMethod("cash");
    setNotes("");
  };

  const openCreateDialog = () => {
    setError("");
    setSuccess("");
    resetForm();
    setCreateOpen(true);
  };

  // Look up the original invoice.
  const handleFindInvoice = async () => {
    setError("");
    setSale(null);
    setSelectedProduct("");
    setQuantity("1");

    if (!invoiceNumber.trim()) {
      setError("Enter the original invoice number.");
      return;
    }

    try {
      setInvoiceLoading(true);

      const response = getPayload(
        await getSaleForReturnAPI(invoiceNumber.trim())
      );

      if (!response?.success || !response?.sale) {
        throw new Error(
          response?.message || "Invoice was not found."
        );
      }

      setSale(response.sale as OriginalSale);

      if (!response.sale.items?.some(
        (item: ReturnableItem) => item.remainingQuantity > 0
      )) {
        setError("All products on this invoice have already been returned.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to find this invoice."
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  const selectedItem = useMemo(
    () =>
      sale?.items.find(
        (item) => item.product === selectedProduct
      ) ?? null,
    [sale, selectedProduct]
  );

  const validQuantity =
    Number.isSafeInteger(Number(quantity)) &&
    Number(quantity) > 0 &&
    Number(quantity) <= (selectedItem?.remainingQuantity ?? 0);

  // This preview uses the original unit selling price.
  const refundPreview = useMemo(() => {
    if (!selectedItem || !validQuantity) return 0;

    return Number(
      (selectedItem.price * Number(quantity)).toFixed(3)
    );
  }, [selectedItem, quantity, validQuantity]);

  const handleCreateReturn = async () => {
    setError("");
    setSuccess("");

    if (!sale) {
      setError("Find a valid invoice first.");
      return;
    }

    if (!selectedItem) {
      setError("Select a product to return.");
      return;
    }

    if (!validQuantity) {
      setError(
        `Enter a quantity from 1 to ${selectedItem.remainingQuantity}.`
      );
      return;
    }

    if (!reason.trim()) {
      setError("Choose or enter a return reason.");
      return;
    }

    const returnData: CreateSalesReturnData = {
      invoiceNumber: sale.invoiceNumber,
      items: [
        {
          product: selectedItem.product,
          quantity: Number(quantity),
        },
      ],
      reason: reason.trim(),
      refundMethod,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      const response = getPayload(
        await createSalesReturnAPI(returnData)
      );

      if (!response?.success || !response?.salesReturn) {
        throw new Error(
          response?.message || "Could not process the return."
        );
      }

      const saved = response.salesReturn;

      const receipt: CreatedReturn = {
        returnNumber: saved.returnNumber,
        invoiceNumber: saved.invoiceNumber,
        refundAmount: Number(saved.refundAmount),
        refundMethod: saved.refundMethod,
        reason: saved.reason,
        createdAt: saved.createdAt || new Date().toISOString(),
        items: saved.items || [
          {
            productName: selectedItem.productName,
            quantity: Number(quantity),
            price: selectedItem.price,
            subtotal: refundPreview,
          },
        ],
      };

      setCompletedReturn(receipt);
      setCreateOpen(false);
      setReceiptOpen(true);
      resetForm();

      // Reload from the server so the table reflects persisted data.
      await loadReturns();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create sales return."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredReturns = returns.filter((item) => {
    const term = search.toLowerCase();

    return (
      item.returnNumber?.toLowerCase().includes(term) ||
      item.invoiceNumber?.toLowerCase().includes(term) ||
      item.reason?.toLowerCase().includes(term) ||
      item.refundMethod?.toLowerCase().includes(term)
    );
  });

  const printReceipt = () => {
    if (!completedReturn) return;

    const receipt = completedReturn;
    const safe = (value: unknown) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[character];
      });

    const itemRows = (receipt.items || [])
      .map(
        (item) => `
          <tr>
            <td>${safe(item.productName)}</td>
            <td>${item.quantity}</td>
            <td>OMR ${Number(item.price).toFixed(3)}</td>
            <td>OMR ${Number(item.subtotal).toFixed(3)}</td>
          </tr>`
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=800,height=700");

    if (!printWindow) {
      setError("Allow pop-ups to print the return receipt.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Return Receipt ${safe(receipt.returnNumber)}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 720px;
              margin: 35px auto; padding: 20px; color: #222; }
            h1, p { margin-bottom: 8px; }
            .muted { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { text-align: left; padding: 10px 6px;
              border-bottom: 1px solid #ddd; }
            .total { margin-top: 24px; text-align: right; font-size: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>SUPERMART</h1>
          <p class="muted">Sales Return Receipt</p>
          <hr />
          <p><b>Return number:</b> ${safe(receipt.returnNumber)}</p>
          <p><b>Original invoice:</b> ${safe(receipt.invoiceNumber)}</p>
          <p><b>Date:</b> ${safe(new Date(receipt.createdAt || "").toLocaleString())}</p>
          <p><b>Reason:</b> ${safe(receipt.reason)}</p>
          <p><b>Refund method:</b> ${safe(receipt.refundMethod)}</p>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div class="total">
            <b>Refund total: OMR ${Number(receipt.refundAmount).toFixed(3)}</b>
          </div>
          <p class="muted">This receipt records the return. It is not proof that a payment provider has transferred money.</p>
          <button onclick="window.print()">Print receipt</button>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Sales Returns
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage product returns, refunds and return receipts.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Create Return
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={() => void loadReturns()}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search return number, invoice, reason..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.500" }} />,
            },
          }}
        />
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Return Number</TableCell>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Refund Method</TableCell>
              <TableCell align="right">Refund Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                  <Typography sx={{ mt: 1 }}>Loading returns...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredReturns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  No saved sales returns found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReturns.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {item.returnNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.invoiceNumber}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{item.refundMethod}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {formatOMR(item.refundAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.status}
                      color={item.status === "Completed" ? "success" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create return dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          if (!saving) setCreateOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={700}>Create Sales Return</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <Alert severity="info">
              Find the original invoice first. Only the remaining quantity
              can be returned.
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Original Invoice Number"
                value={invoiceNumber}
                onChange={(event) => {
                  setInvoiceNumber(event.target.value);
                  setSale(null);
                  setSelectedProduct("");
                  setQuantity("1");
                }}
                required
              />
              <Button
                variant="contained"
                onClick={() => void handleFindInvoice()}
                disabled={invoiceLoading || saving}
              >
                {invoiceLoading ? "Searching..." : "Find Sale"}
              </Button>
            </Stack>

            {sale && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>
                  Invoice: {sale.invoiceNumber}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Original sale total: {formatOMR(sale.total)}
                </Typography>
                {sale.createdAt && (
                  <Typography color="text.secondary" variant="body2">
                    Date: {new Date(sale.createdAt).toLocaleString()}
                  </Typography>
                )}
              </Paper>
            )}

            {sale && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="return-product-label">
                    Select Product
                  </InputLabel>
                  <Select
                    labelId="return-product-label"
                    label="Select Product"
                    value={selectedProduct}
                    onChange={(event) => {
                      setSelectedProduct(event.target.value);
                      setQuantity("1");
                    }}
                  >
                    {sale.items
                      .filter((item) => item.remainingQuantity > 0)
                      .map((item) => (
                        <MenuItem key={item.product} value={item.product}>
                          {item.productName} — Returnable:{" "}
                          {item.remainingQuantity}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {selectedItem && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography fontWeight={700}>
                      {selectedItem.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchased: {selectedItem.quantity} · Already returned:{" "}
                      {selectedItem.returnedQuantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining: {selectedItem.remainingQuantity}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Original unit price: {formatOMR(selectedItem.price)}
                    </Typography>
                  </Paper>
                )}

                <TextField
                  label="Return Quantity"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: selectedItem?.remainingQuantity ?? 1,
                      step: 1,
                    },
                  }}
                  error={Boolean(selectedItem) && !validQuantity}
                  helperText={
                    selectedItem
                      ? `Enter 1 to ${selectedItem.remainingQuantity}`
                      : "Select a product first."
                  }
                />

                <TextField
                  select
                  fullWidth
                  label="Return Reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                >
                  <MenuItem value="Damaged product">Damaged product</MenuItem>
                  <MenuItem value="Wrong item">Wrong item</MenuItem>
                  <MenuItem value="Expired product">Expired product</MenuItem>
                  <MenuItem value="Customer changed mind">
                    Customer changed mind
                  </MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>

                <FormControl fullWidth>
                  <InputLabel id="refund-method-label">
                    Refund Method
                  </InputLabel>
                  <Select
                    labelId="refund-method-label"
                    label="Refund Method"
                    value={refundMethod}
                    onChange={(event) => setRefundMethod(event.target.value)}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Notes (optional)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />

                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "action.hover" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Estimated refund
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {formatOMR(refundPreview)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unit price × return quantity. Final amount is calculated
                    by the backend. Tax and discount allocation must be
                    applied there if applicable.
                  </Typography>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            disabled={saving}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            onClick={() => void handleCreateReturn()}
            disabled={
              saving ||
              !sale ||
              !selectedItem ||
              !validQuantity ||
              !reason.trim()
            }
          >
            {saving ? "Processing..." : "Confirm Return"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Printable return receipt */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Return Receipt</DialogTitle>
        <DialogContent>
          {completedReturn && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="success">
                Return saved successfully.
              </Alert>
              <Typography>
                <b>Return number:</b> {completedReturn.returnNumber}
              </Typography>
              <Typography>
                <b>Original invoice:</b> {completedReturn.invoiceNumber}
              </Typography>
              <Typography>
                <b>Date:</b>{" "}
                {new Date(
                  completedReturn.createdAt || ""
                ).toLocaleString()}
              </Typography>
              <Typography>
                <b>Reason:</b> {completedReturn.reason}
              </Typography>
              <Typography>
                <b>Refund method:</b> {completedReturn.refundMethod}
              </Typography>
              <Divider />
              {(completedReturn.items || []).map((item, index) => (
                <Stack
                  key={`${item.productName}-${index}`}
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography>{item.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × {formatOMR(item.price)}
                    </Typography>
                  </Box>
                  <Typography fontWeight={600}>
                    {formatOMR(item.subtotal)}
                  </Typography>
                </Stack>
              ))}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={700}>Refund Total</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatOMR(completedReturn.refundAmount)}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                This receipt records the return. It does not itself transfer
                money to the customer.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReceiptOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={printReceipt}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesReturns;
