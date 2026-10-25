import { useEffect, useMemo, useState } from "react";

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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  getPurchasesAPI,
  createPurchaseAPI,
  receivePurchaseAPI,
  cancelPurchaseAPI,
  deletePurchaseAPI,
} from "../../api/purchaseApi";

import { getSuppliersAPI } from "../../api/supplierApi";
import { getProductsAPI } from "../../api/productApi";

// ======================================================
// TYPES
// ======================================================

interface Supplier {
  _id: string;
  companyName: string;
  contactPerson?: string;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
}

interface PurchaseItem {
  product: string;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplierName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  purchaseStatus: string;
  paymentMethod: string;
  notes?: string;
}

interface NewItem {
  productId: string;
  quantity: string;
  costPrice: string;
}

// ======================================================
// COMPONENT
// ======================================================

const Purchases = () => {
  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ====================================================
  // DIALOG
  // ====================================================

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [paymentStatus, setPaymentStatus] =
    useState("Pending");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState<PurchaseItem[]>([]);

  // ====================================================
  // NEW ITEM
  // ====================================================

  const [newItem, setNewItem] =
    useState<NewItem>({
      productId: "",
      quantity: "",
      costPrice: "",
    });

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        purchaseData,
        supplierData,
        productData,
      ] = await Promise.all([
        getPurchasesAPI(),
        getSuppliersAPI(),
        getProductsAPI(),
      ]);

      console.log(
        "Purchase response:",
        purchaseData
      );

      console.log(
        "Supplier response:",
        supplierData
      );

      console.log(
        "Product response:",
        productData
      );

      setPurchases(
        purchaseData?.purchases ||
          purchaseData?.data?.purchases ||
          []
      );

      setSuppliers(
        supplierData?.suppliers ||
          supplierData?.data?.suppliers ||
          supplierData?.data ||
          []
      );

      setProducts(
        productData?.products ||
          productData?.data?.products ||
          productData?.data ||
          []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load purchase data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================================
  // OPEN CREATE
  // ====================================================

  const handleAddPurchase = () => {
    setSelectedSupplier("");
    setPurchaseDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setPaymentStatus("Pending");
    setPaymentMethod("Cash");
    setNotes("");
    setItems([]);

    setNewItem({
      productId: "",
      quantity: "",
      costPrice: "",
    });

    setError("");
    setOpenDialog(true);
  };

  // ====================================================
  // CLOSE
  // ====================================================

  const handleClose = () => {
    if (saving) return;

    setOpenDialog(false);
  };

  // ====================================================
  // ADD ITEM
  // ====================================================

  const handleAddItem = () => {
    if (!newItem.productId) {
      setError("Select a product");
      return;
    }

    const quantity =
      Number(newItem.quantity);

    const costPrice =
      Number(newItem.costPrice);

    if (
      !quantity ||
      quantity <= 0
    ) {
      setError(
        "Enter a valid quantity"
      );
      return;
    }

    if (
      costPrice < 0 ||
      newItem.costPrice === ""
    ) {
      setError(
        "Enter a valid cost price"
      );
      return;
    }

    const product =
      products.find(
        (item) =>
          item._id ===
          newItem.productId
      );

    if (!product) {
      setError(
        "Product not found"
      );
      return;
    }

    const alreadyAdded =
      items.some(
        (item) =>
          item.product ===
          product._id
      );

    if (alreadyAdded) {
      setError(
        "This product is already added"
      );
      return;
    }

    const item: PurchaseItem = {
      product:
        product._id,

      productName:
        product.name,

      sku:
        product.sku || "",

      quantity,

      costPrice,

      total:
        quantity * costPrice,
    };

    setItems(
      (previous) => [
        ...previous,
        item,
      ]
    );

    setNewItem({
      productId: "",
      quantity: "",
      costPrice: "",
    });

    setError("");
  };

  // ====================================================
  // REMOVE ITEM
  // ====================================================

  const handleRemoveItem = (
    productId: string
  ) => {
    setItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.product !==
            productId
        )
    );
  };

  // ====================================================
  // TOTAL
  // ====================================================

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.total,
        0
      ),
    [items]
  );

  const tax = 0;

  const discount = 0;

  const totalAmount =
    subtotal + tax - discount;

  // ====================================================
  // CREATE PURCHASE
  // ====================================================

  const handleCreatePurchase =
    async () => {
      try {
        setSaving(true);
        setError("");
        setSuccess("");

        if (!selectedSupplier) {
          setError(
            "Select a supplier"
          );
          return;
        }

        if (items.length === 0) {
          setError(
            "Add at least one product"
          );
          return;
        }

        const supplier =
          suppliers.find(
            (item) =>
              item._id ===
              selectedSupplier
          );

        if (!supplier) {
          setError(
            "Supplier not found"
          );
          return;
        }

        const purchaseData = {
          supplier:
            supplier._id,

          supplierName:
            supplier.companyName,

          purchaseDate,

          items,

          subtotal,

          tax,

          discount,

          totalAmount,

          paymentStatus,

          paymentMethod,

          notes,
        };

        console.log(
          "Creating purchase:",
          purchaseData
        );

        await createPurchaseAPI(
          purchaseData
        );

        setSuccess(
          "Purchase created successfully"
        );

        setOpenDialog(false);

        await loadData();
      } catch (err: any) {
        console.error(
          "Create purchase error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to create purchase"
        );
      } finally {
        setSaving(false);
      }
    };

  // ====================================================
  // RECEIVE
  // ====================================================

  const handleReceive =
    async (
      purchase: Purchase
    ) => {
      const confirmed =
        window.confirm(
          `Receive ${purchase.purchaseNumber}? This will increase product stock.`
        );

      if (!confirmed) return;

      try {
        setError("");
        setSuccess("");

        await receivePurchaseAPI(
          purchase._id
        );

        setSuccess(
          `${purchase.purchaseNumber} received successfully. Inventory updated.`
        );

        await loadData();
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to receive purchase"
        );
      }
    };

  // ====================================================
  // CANCEL
  // ====================================================

  const handleCancel =
    async (
      purchase: Purchase
    ) => {
      const confirmed =
        window.confirm(
          `Cancel ${purchase.purchaseNumber}?`
        );

      if (!confirmed) return;

      try {
        setError("");
        setSuccess("");

        await cancelPurchaseAPI(
          purchase._id
        );

        setSuccess(
          `${purchase.purchaseNumber} cancelled`
        );

        await loadData();
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to cancel purchase"
        );
      }
    };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete =
    async (
      purchase: Purchase
    ) => {
      const confirmed =
        window.confirm(
          `Delete ${purchase.purchaseNumber}?`
        );

      if (!confirmed) return;

      try {
        setError("");
        setSuccess("");

        await deletePurchaseAPI(
          purchase._id
        );

        setSuccess(
          "Purchase deleted successfully"
        );

        await loadData();
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete purchase"
        );
      }
    };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredPurchases =
    purchases.filter(
      (purchase) => {
        const text =
          search.toLowerCase();

        return (
          purchase.purchaseNumber
            ?.toLowerCase()
            .includes(text) ||
          purchase.supplierName
            ?.toLowerCase()
            .includes(text) ||
          purchase.purchaseStatus
            ?.toLowerCase()
            .includes(text)
        );
      }
    );

  // ====================================================
  // UI
  // ====================================================

  return (
    <Stack spacing={3}>

      {/* HEADER */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <div>
          <Typography
            variant="h4"
            fontWeight={600}
          >
            Purchases
          </Typography>

          <Typography
            color="text.secondary"
          >
            Manage supplier purchases
            and stock receiving
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={
            <AddIcon />
          }
          onClick={
            handleAddPurchase
          }
        >
          New Purchase
        </Button>
      </Stack>

      {/* SUCCESS */}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      )}

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {/* SEARCH */}

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search purchases"
          placeholder="Purchase number, supplier or status..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </Paper>

      {/* TABLE */}

      <TableContainer
        component={Paper}
      >
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

                <TableCell>
                  <strong>
                    Purchase No.
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Supplier
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Date
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Items
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Total
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Payment
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Status
                  </strong>
                </TableCell>

                <TableCell align="right">
                  <strong>
                    Actions
                  </strong>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {filteredPurchases.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                  >
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map(
                  (purchase) => (
                    <TableRow
                      key={
                        purchase._id
                      }
                      hover
                    >

                      <TableCell>
                        <Typography
                          fontWeight={600}
                        >
                          {
                            purchase.purchaseNumber
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {
                          purchase.supplierName
                        }
                      </TableCell>

                      <TableCell>
                        {purchase.purchaseDate
                          ? new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {
                          purchase.items
                            ?.length || 0
                        }
                      </TableCell>

                      <TableCell>
                        OMR{" "}
                        {Number(
                          purchase.totalAmount ||
                            0
                        ).toFixed(3)}
                      </TableCell>

                      <TableCell>
                        {
                          purchase.paymentStatus
                        }
                      </TableCell>

                      <TableCell>
                        {
                          purchase.purchaseStatus
                        }
                      </TableCell>

                      <TableCell align="right">

                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >

                          {purchase.purchaseStatus !==
                            "Received" &&
                            purchase.purchaseStatus !==
                              "Cancelled" && (
                              <>
                                <Button
                                  size="small"
                                  color="success"
                                  startIcon={
                                    <CheckCircleIcon />
                                  }
                                  onClick={() =>
                                    handleReceive(
                                      purchase
                                    )
                                  }
                                >
                                  Receive
                                </Button>

                                <Button
                                  size="small"
                                  color="warning"
                                  startIcon={
                                    <CancelIcon />
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      purchase
                                    )
                                  }
                                >
                                  Cancel
                                </Button>

                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={
                                    <DeleteIcon />
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      purchase
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              </>
                            )}

                        </Stack>

                      </TableCell>

                    </TableRow>
                  )
                )
              )}

            </TableBody>

          </Table>
        )}
      </TableContainer>

      {/* ==================================================
          NEW PURCHASE DIALOG
      ================================================== */}

      <Dialog
        open={openDialog}
        onClose={() => {
          if (!saving) {
            setOpenDialog(false);
          }
        }}
        fullWidth
        maxWidth="md"
      >

        <DialogTitle>
          New Purchase
        </DialogTitle>

        <DialogContent>

          <Stack
            spacing={3}
            sx={{ mt: 1 }}
          >

            {/* SUPPLIER */}

            <FormControl fullWidth>
              <InputLabel>
                Supplier
              </InputLabel>

              <Select
                value={
                  selectedSupplier
                }
                label="Supplier"
                onChange={(e) =>
                  setSelectedSupplier(
                    e.target.value
                  )
                }
              >

                <MenuItem value="">
                  Select supplier
                </MenuItem>

                {suppliers.map(
                  (supplier) => (
                    <MenuItem
                      key={
                        supplier._id
                      }
                      value={
                        supplier._id
                      }
                    >
                      {
                        supplier.companyName
                      }
                    </MenuItem>
                  )
                )}

              </Select>
            </FormControl>

            {/* DATE */}

            <TextField
              fullWidth
              type="date"
              label="Purchase Date"
              value={
                purchaseDate
              }
              onChange={(e) =>
                setPurchaseDate(
                  e.target.value
                )
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            {/* ADD PRODUCT */}

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Add Products
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
              >

                <FormControl
                  fullWidth
                >

                  <InputLabel>
                    Product
                  </InputLabel>

                  <Select
                    value={
                      newItem.productId
                    }
                    label="Product"
                    onChange={(e) =>
                      setNewItem(
                        (previous) => ({
                          ...previous,
                          productId:
                            e.target
                              .value,
                        })
                      )
                    }
                  >

                    <MenuItem value="">
                      Select product
                    </MenuItem>

                    {products.map(
                      (product) => (
                        <MenuItem
                          key={
                            product._id
                          }
                          value={
                            product._id
                          }
                        >
                          {product.name}
                          {product.sku
                            ? ` (${product.sku})`
                            : ""}
                        </MenuItem>
                      )
                    )}

                  </Select>

                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  value={
                    newItem.quantity
                  }
                  onChange={(e) =>
                    setNewItem(
                      (previous) => ({
                        ...previous,
                        quantity:
                          e.target
                            .value,
                      })
                    )
                  }
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                />

                <TextField
                  label="Cost Price"
                  type="number"
                  value={
                    newItem.costPrice
                  }
                  onChange={(e) =>
                    setNewItem(
                      (previous) => ({
                        ...previous,
                        costPrice:
                          e.target
                            .value,
                      })
                    )
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 0.001,
                    },
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={
                    <AddIcon />
                  }
                  onClick={
                    handleAddItem
                  }
                >
                  Add
                </Button>

              </Stack>

            </Paper>

            {/* ITEMS */}

            {items.length > 0 && (

              <TableContainer
                component={
                  Paper
                }
                variant="outlined"
              >

                <Table>

                  <TableHead>
                    <TableRow>

                      <TableCell>
                        Product
                      </TableCell>

                      <TableCell>
                        SKU
                      </TableCell>

                      <TableCell>
                        Qty
                      </TableCell>

                      <TableCell>
                        Cost
                      </TableCell>

                      <TableCell>
                        Total
                      </TableCell>

                      <TableCell>
                        Action
                      </TableCell>

                    </TableRow>
                  </TableHead>

                  <TableBody>

                    {items.map(
                      (item) => (

                        <TableRow
                          key={
                            item.product
                          }
                        >

                          <TableCell>
                            {
                              item.productName
                            }
                          </TableCell>

                          <TableCell>
                            {
                              item.sku ||
                              "-"
                            }
                          </TableCell>

                          <TableCell>
                            {
                              item.quantity
                            }
                          </TableCell>

                          <TableCell>
                            OMR{" "}
                            {item.costPrice.toFixed(
                              3
                            )}
                          </TableCell>

                          <TableCell>
                            OMR{" "}
                            {item.total.toFixed(
                              3
                            )}
                          </TableCell>

                          <TableCell>

                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                handleRemoveItem(
                                  item.product
                                )
                              }
                            >
                              Remove
                            </Button>

                          </TableCell>

                        </TableRow>

                      )
                    )}

                  </TableBody>

                </Table>

              </TableContainer>

            )}

            {/* TOTALS */}

            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >

              <Stack spacing={1}>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>
                    Subtotal
                  </Typography>

                  <Typography>
                    OMR{" "}
                    {subtotal.toFixed(
                      3
                    )}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>
                    Tax
                  </Typography>

                  <Typography>
                    OMR{" "}
                    {tax.toFixed(3)}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>
                    Discount
                  </Typography>

                  <Typography>
                    OMR{" "}
                    {discount.toFixed(
                      3
                    )}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Total
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    OMR{" "}
                    {totalAmount.toFixed(
                      3
                    )}
                  </Typography>

                </Stack>

              </Stack>

            </Paper>

            {/* PAYMENT */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <FormControl fullWidth>

                <InputLabel>
                  Payment Status
                </InputLabel>

                <Select
                  value={
                    paymentStatus
                  }
                  label="Payment Status"
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="Pending">
                    Pending
                  </MenuItem>

                  <MenuItem value="Partially Paid">
                    Partially Paid
                  </MenuItem>

                  <MenuItem value="Paid">
                    Paid
                  </MenuItem>

                </Select>

              </FormControl>

              <FormControl fullWidth>

                <InputLabel>
                  Payment Method
                </InputLabel>

                <Select
                  value={
                    paymentMethod
                  }
                  label="Payment Method"
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="Cash">
                    Cash
                  </MenuItem>

                  <MenuItem value="Bank Transfer">
                    Bank Transfer
                  </MenuItem>

                  <MenuItem value="Card">
                    Card
                  </MenuItem>

                  <MenuItem value="Credit">
                    Credit
                  </MenuItem>

                </Select>

              </FormControl>

            </Stack>

            {/* NOTES */}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
            />

          </Stack>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={
              handleClose
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCreatePurchase
            }
            disabled={
              saving ||
              items.length === 0
            }
          >

            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Create Purchase"
            )}

          </Button>

        </DialogActions>

      </Dialog>

    </Stack>
  );
};

export default Purchases;