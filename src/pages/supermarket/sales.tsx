
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";


import {
  getSalesAPI,
  createSaleAPI,
  deleteSaleAPI,
} from "../../api/salesApi";

import { getProductsAPI } from "../../api/productApi";
import InvoiceDialog, { InvoiceSale } from "./InvoiceDiolog";

// ================================
// TYPES
// ================================
interface Product {
  _id: string;
  name: string;
  sku?: string;
  sellingPrice?: number;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

interface CartItem {
  product: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
}

// ================================
// HELPERS
// ================================
const formatOMR = (value: unknown): string => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toFixed(3) : "0.000";
};

const getSellingPrice = (product: Product): number =>
  Number(product.sellingPrice ?? product.price);

const getArrayFromResponse = (response: any, keys: string[]): any[] => {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    for (const key of keys) {
      if (Array.isArray(candidate?.[key])) {
        return candidate[key];
      }
    }
  }

  return [];
};

// ================================
// SALES COMPONENT
// ================================
const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  // ================================
  // LOAD SALES AND PRODUCTS
  // ================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [salesResponse, productsResponse] = await Promise.all([
        getSalesAPI(),
        getProductsAPI(),
      ]);

      const salesList = getArrayFromResponse(salesResponse, ["sales"]);
      const productsList = getArrayFromResponse(productsResponse, [
        "products",
      ]);

      setSales(salesList);
      setProducts(productsList);

      console.log("Sales loaded:", salesList);
      console.log("Products loaded:", productsList);
    } catch (err: any) {
      console.error("Load sales page error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load sales and products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ================================
  // OPEN NEW SALE
  // ================================
  const handleNewSale = () => {
    setCart([]);
    setSelectedProduct("");
    setQuantity("1");
    setTaxRate("0");
    setPaymentMethod("cash");
    setCustomerName("Walk-in Customer");
    setCustomerPhone("");
    setError("");
    setSuccess("");
    setOpenDialog(true);
  };

  // ================================
  // ADD PRODUCT TO CART
  // ================================
  const handleAddToCart = () => {
    setError("");

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      setError("Enter a valid whole-number quantity.");
      return;
    }

    const product = products.find(
      (item) => item._id === selectedProduct
    );

    if (!product) {
      setError("Product not found. Refresh the page and try again.");
      return;
    }

    const price = getSellingPrice(product);

    if (!Number.isFinite(price) || price < 0) {
      setError(`The selling price for ${product.name} is invalid.`);
      return;
    }

    const stock = Number(product.stock ?? 0);

    const existingItem = cart.find(
      (item) => item.product === product._id
    );

    const combinedQuantity = (existingItem?.quantity ?? 0) + qty;

    if (combinedQuantity > stock) {
      setError(
        `Only ${stock} units of ${product.name} are available.`
      );
      return;
    }

    if (existingItem) {
      setCart((current) =>
        current.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity: item.quantity + qty,
                subtotal: Number(
                  ((item.quantity + qty) * item.price).toFixed(3)
                ),
              }
            : item
        )
      );
    } else {
      setCart((current) => [
        ...current,
        {
          product: product._id,
          name: product.name,
          sku: product.sku,
          quantity: qty,
          price,
          subtotal: Number((price * qty).toFixed(3)),
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity("1");
  };

  // ================================
  // REMOVE PRODUCT
  // ================================
  const handleRemoveItem = (productId: string) => {
    setCart((current) =>
      current.filter((item) => item.product !== productId)
    );
    setError("");
  };

  // ================================
  // UPDATE CART QUANTITY
  // ================================
  const handleChangeQuantity = (
    productId: string,
    newQuantity: number
  ) => {
    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return;
    }

    const product = products.find(
      (item) => item._id === productId
    );

    if (!product) return;

    const stock = Number(product.stock ?? 0);

    if (newQuantity > stock) {
      setError(`Only ${stock} units of ${product.name} are available.`);
      return;
    }

    setError("");

    setCart((current) =>
      current.map((item) =>
        item.product === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: Number(
                (newQuantity * item.price).toFixed(3)
              ),
            }
          : item
      )
    );
  };

  // ================================
  // TOTALS
  // ================================
  const subtotal = useMemo(
    () =>
      Number(
        cart
          .reduce((sum, item) => sum + item.subtotal, 0)
          .toFixed(3)
      ),
    [cart]
  );

  const taxNumber = Number(taxRate);

  const validTaxRate =
    Number.isFinite(taxNumber) &&
    taxNumber >= 0 &&
    taxNumber <= 100;

  const taxAmount = validTaxRate
    ? Number((subtotal * (taxNumber / 100)).toFixed(3))
    : 0;

  const total = Number((subtotal + taxAmount).toFixed(3));

  // ================================
  // COMPLETE SALE
  // ================================
  
const handleCreateSale = async () => {
  setError("");
  setSuccess("");

  if (cart.length === 0) {
    setError("Please add at least one product.");
    return;
  }

  if (!validTaxRate) {
    setError("Tax percentage must be between 0 and 100.");
    return;
  }

  try {
    setSaving(true);

    // Send product IDs, quantities, and calculated tax amount.
    const saleData = {
      items: cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      tax: taxAmount,
      paymentMethod,
      customerName: customerName.trim() || "Walk-in Customer",
      customerPhone: customerPhone.trim(),
    };

    const response = await createSaleAPI(saleData);

    // Ensure the backend returned the saved sale.
    if (!response?.sale || response?.success === false) {
      throw new Error(
        response?.message || "Sale could not be created."
      );
    }

    // Save the returned sale for the invoice dialog.
    setCompletedSale(response.sale);

    // Close the New Sale dialog and open the invoice.
    setOpenDialog(false);
    setInvoiceOpen(true);

    // Clear the cart after successful creation.
    setCart([]);

    setSuccess(
      `Sale ${response.sale.invoiceNumber} created successfully.`
    );

    // Refresh sales and inventory.
    await loadData();
  } catch (err: any) {
    console.error("Create sale error:", err);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to create sale."
    );
  } finally {
    setSaving(false);
  }
};


  // ================================
  // DELETE  
  // ================================
  const handleDeleteSale = async (sale: Sale) => {
    const confirmed = window.confirm(
      `Delete invoice ${sale.invoiceNumber}? Stock will be restored.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteSaleAPI(sale._id);

      setSuccess("Sale deleted and stock restored.");
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not delete sale."
      );
    }
  };

  // ================================
  // SEARCH SALES
  // ================================
  const filteredSales = sales.filter((sale) => {
    const query = search.trim().toLowerCase();

    return (
      sale.invoiceNumber?.toLowerCase().includes(query) ||
      sale.customerName?.toLowerCase().includes(query) ||
      sale.paymentMethod?.toLowerCase().includes(query)
    );
  });

  const closeSaleDialog = () => {
    if (!saving) setOpenDialog(false);
  };
  // ================================
  //ivoice
  // ================================
const [completedSale, setCompletedSale] =
  useState<InvoiceSale | null>(null);

const [invoiceOpen, setInvoiceOpen] = useState(false);
  // ================================
  // UI
  // ================================
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <div>
          <Typography variant="h4" fontWeight={700}>
            Sales
          </Typography>
          <Typography color="text.secondary">
            Manage supermarket sales and POS transactions.
          </Typography>
        </div>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void loadData()}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<PointOfSaleIcon />}
            onClick={handleNewSale}
          >
            New Sale
          </Button>
        </Stack>
      </Stack>

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && !openDialog && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search sales"
          placeholder="Search invoice, customer, or payment method"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ p: 8 }}
          >
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No sales found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {sale.invoiceNumber}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {sale.customerName || "Walk-in Customer"}
                    </TableCell>

                    <TableCell>
                      {sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>{sale.items?.length ?? 0}</TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        OMR {formatOMR(sale.total)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={sale.paymentMethod}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setSelectedSale(sale);
                            setOpenViewDialog(true);
                          }}
                        >
                          View
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => void handleDeleteSale(sale)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* NEW SALE DIALOG */}
      <Dialog
        open={openDialog}
        onClose={closeSaleDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>New Sale</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* CUSTOMER DETAILS */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
              />

              <TextField
                fullWidth
                label="Customer Phone"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
              />
            </Stack>

            {/* ADD PRODUCT */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Product
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <FormControl fullWidth>
                  <InputLabel id="sale-product-label">
                    Product
                  </InputLabel>

                  <Select
                    labelId="sale-product-label"
                    label="Product"
                    value={selectedProduct}
                    onChange={(event) =>
                      setSelectedProduct(event.target.value)
                    }
                  >
                    <MenuItem value="">
                      Select product
                    </MenuItem>

                    {products
                      .filter(
                        (product) =>
                          product.isActive !== false &&
                          Number(product.stock ?? 0) > 0
                      )
                      .map((product) => {
                        const price = getSellingPrice(product);

                        return (
                          <MenuItem
                            key={product._id}
                            value={product._id}
                          >
                            {product.name} — OMR{" "}
                            {Number.isFinite(price)
                              ? formatOMR(price)
                              : "Price missing"}{" "}
                            | Stock: {product.stock ?? 0}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  sx={{ minWidth: 120 }}
                  slotProps={{
                    htmlInput: { min: 1, step: 1 },
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddToCart}
                >
                  Add
                </Button>
              </Stack>

              {products.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No products were returned by the product API. Check
                  the browser Console and your product endpoint.
                </Alert>
              )}
            </Paper>

            {/* CART TABLE */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No products added.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item) => (
                      <TableRow key={item.product}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku || "-"}</TableCell>

                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(event) =>
                              handleChangeQuantity(
                                item.product,
                                Number(event.target.value)
                              )
                            }
                            slotProps={{
                              htmlInput: { min: 1, step: 1 },
                            }}
                            sx={{ width: 90 }}
                          />
                        </TableCell>

                        <TableCell>
                          OMR {formatOMR(item.price)}
                        </TableCell>

                        <TableCell>
                          OMR {formatOMR(item.subtotal)}
                        </TableCell>

                        <TableCell>
                          <Button
                            color="error"
                            size="small"
                            onClick={() =>
                              handleRemoveItem(item.product)
                            }
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* TOTALS AND PERCENTAGE TAX */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>Subtotal</Typography>
                  <Typography fontWeight={600}>
                    OMR {formatOMR(subtotal)}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography>Tax (%)</Typography>

                  <TextField
                    type="number"
                    size="small"
                    value={taxRate}
                    onChange={(event) =>
                      setTaxRate(event.target.value)
                    }
                    error={!validTaxRate}
                    helperText={
                      validTaxRate
                        ? "Enter 10 for 10% tax"
                        : "Tax must be between 0 and 100"
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: 100,
                        step: 0.1,
                      },
                    }}
                    sx={{ width: 200 }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>Tax amount</Typography>
                  <Typography>
                    OMR {formatOMR(taxAmount)}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    OMR {formatOMR(total)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* PAYMENT METHOD */}
            <FormControl fullWidth>
              <InputLabel id="payment-method-label">
                Payment Method
              </InputLabel>

              <Select
                labelId="payment-method-label"
                label="Payment Method"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeSaleDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleCreateSale()}
            disabled={
              saving ||
              cart.length === 0 ||
              !validTaxRate
            }
          >
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Complete Sale"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW SALE DIALOG */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Sale Details</DialogTitle>

        <DialogContent>
          {selectedSale && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <div>
                  <Typography variant="h6">
                    {selectedSale.invoiceNumber}
                  </Typography>

                  <Typography color="text.secondary">
                    {selectedSale.createdAt
                      ? new Date(
                          selectedSale.createdAt
                        ).toLocaleString()
                      : "-"}
                  </Typography>
                </div>

                <div>
                  <Typography>
                    Customer:{" "}
                    {selectedSale.customerName ||
                      "Walk-in Customer"}
                  </Typography>

                  <Typography>
                    Phone: {selectedSale.customerPhone || "-"}
                  </Typography>

                  <Typography>
                    Payment: {selectedSale.paymentMethod}
                  </Typography>
                </div>
              </Stack>

              <TableContainer
                component={Paper}
                variant="outlined"
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedSale.items?.map((item, index) => (
                      <TableRow
                        key={`${item.product}-${index}`}
                      >
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          OMR {formatOMR(item.price)}
                        </TableCell>
                        <TableCell>
                          OMR {formatOMR(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>Subtotal</Typography>
                    <Typography>
                      OMR {formatOMR(selectedSale.subtotal)}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>Tax amount</Typography>
                    <Typography>
                      OMR {formatOMR(selectedSale.tax)}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      OMR {formatOMR(selectedSale.total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
<InvoiceDialog
  open={invoiceOpen}
  sale={completedSale}
  onClose={() => setInvoiceOpen(false)}
  storeName="SUPERMART"
  storeAddress="Oman"
  storePhone=""
  storeTaxNumber=""
/>

        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Sales;
