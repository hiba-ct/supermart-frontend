import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HistoryIcon from "@mui/icons-material/History";

import {
  getInventoryAPI,
  adjustStockAPI,
  getStockHistoryAPI,
} from "../../api/inventoryApi";


// ======================================================
// TYPES
// ======================================================

interface InventoryItem {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  stock: number;
  lowStockThreshold: number;
  unit?: string;
  sellingPrice?: number;
  status:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK";
}

interface HistoryItem {
  _id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;
  createdAt: string;
}


// ======================================================
// COMPONENT
// ======================================================

const Inventory = () => {

  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ====================================================
  // STOCK DIALOG
  // ====================================================

  const [stockDialog, setStockDialog] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<InventoryItem | null>(null);

  const [stockType, setStockType] =
    useState<
      "IN" | "OUT" | "ADJUSTMENT"
    >("IN");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  // ====================================================
  // HISTORY DIALOG
  // ====================================================

  const [historyDialog, setHistoryDialog] =
    useState(false);

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);


  // ====================================================
  // LOAD INVENTORY
  // ====================================================

  const loadInventory = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await getInventoryAPI();

      console.log(
        "Inventory response:",
        data
      );

      const list =
        data?.inventory ||
        data?.data?.inventory ||
        [];

      setInventory(
        Array.isArray(list)
          ? list
          : []
      );

    } catch (err: any) {

      console.error(
        "Inventory error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load inventory"
      );

    } finally {

      setLoading(false);
    }
  };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {

    loadInventory();

  }, []);


  // ====================================================
  // OPEN STOCK DIALOG
  // ====================================================

  const openStockDialog = (
    product: InventoryItem,
    type:
      | "IN"
      | "OUT"
      | "ADJUSTMENT"
  ) => {

    setSelectedProduct(product);

    setStockType(type);

    setQuantity("");

    setReason("");

    setReference("");

    setError("");

    setSuccess("");

    setStockDialog(true);
  };


  // ====================================================
  // CLOSE STOCK DIALOG
  // ====================================================

  const closeStockDialog = () => {

    if (saving) return;

    setStockDialog(false);

    setSelectedProduct(null);
  };


  // ====================================================
  // SAVE STOCK
  // ====================================================

  const handleStockSubmit =
    async () => {

      if (!selectedProduct) {
        return;
      }

      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const qty =
          Number(quantity);


        if (
          !qty ||
          qty <= 0
        ) {

          setError(
            "Enter a valid quantity"
          );

          return;
        }


        // ----------------------------------------------
        // PREVENT REMOVING MORE THAN STOCK
        // ----------------------------------------------

        if (
          stockType === "OUT" &&
          qty > selectedProduct.stock
        ) {

          setError(
            `Only ${selectedProduct.stock} ${selectedProduct.unit || ""} available`
          );

          return;
        }


        // ----------------------------------------------
        // API
        // ----------------------------------------------

        await adjustStockAPI({

          productId:
            selectedProduct._id,

          type:
            stockType,

          quantity:
            qty,

          reason:
            reason.trim(),

          reference:
            reference.trim(),
        });


        // ----------------------------------------------
        // SUCCESS
        // ----------------------------------------------

        const message =
          stockType === "IN"
            ? "Stock added successfully"
            : stockType === "OUT"
              ? "Stock removed successfully"
              : "Stock adjusted successfully";


        setSuccess(message);

        setStockDialog(false);

        setSelectedProduct(null);


        // Reload
        await loadInventory();


      } catch (err: any) {

        console.error(
          "Stock adjustment error:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update stock"
        );

      } finally {

        setSaving(false);
      }
    };


  // ====================================================
  // HISTORY
  // ====================================================

  const openHistory =
    async (
      product: InventoryItem
    ) => {

      try {

        setHistoryDialog(true);

        setHistoryLoading(true);

        setHistory([]);

        const data =
          await getStockHistoryAPI(
            product._id
          );

        console.log(
          "History response:",
          data
        );

        setHistory(
          data?.history || []
        );

      } catch (err: any) {

        console.error(
          "History error:",
          err
        );

        setError(
          err?.response?.data?.message ||
          "Failed to load stock history"
        );

      } finally {

        setHistoryLoading(false);
      }
    };


  // ====================================================
  // FILTER
  // ====================================================

  const filteredInventory =
    inventory.filter(
      (item) => {

        const text =
          search.toLowerCase();

        return (
          item.name
            ?.toLowerCase()
            .includes(text) ||

          item.sku
            ?.toLowerCase()
            .includes(text) ||

          item.category
            ?.toLowerCase()
            .includes(text)
        );
      }
    );


  // ====================================================
  // SUMMARY
  // ====================================================

  const totalProducts =
    inventory.length;

  const inStock =
    inventory.filter(
      (item) =>
        item.status ===
        "IN_STOCK"
    ).length;

  const lowStock =
    inventory.filter(
      (item) =>
        item.status ===
        "LOW_STOCK"
    ).length;

  const outOfStock =
    inventory.filter(
      (item) =>
        item.status ===
        "OUT_OF_STOCK"
    ).length;


  // ====================================================
  // UI
  // ====================================================

  return (

    <Stack spacing={3}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <Stack>

        <Typography
          variant="h4"
          fontWeight={600}
        >
          Inventory
        </Typography>

        <Typography
          color="text.secondary"
        >
          Monitor stock levels and manage
          inventory
        </Typography>

      </Stack>


      {/* ==================================================
          SUCCESS
      ================================================== */}

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


      {/* ==================================================
          ERROR
      ================================================== */}

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


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <Grid
        container
        spacing={2}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >

          <Card>

            <CardContent>

              <Typography
                color="text.secondary"
              >
                Total Products
              </Typography>

              <Typography
                variant="h3"
                fontWeight={600}
              >
                {totalProducts}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >

          <Card>

            <CardContent>

              <Typography
                color="text.secondary"
              >
                In Stock
              </Typography>

              <Typography
                variant="h3"
                fontWeight={600}
              >
                {inStock}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >

          <Card>

            <CardContent>

              <Typography
                color="text.secondary"
              >
                Low Stock
              </Typography>

              <Typography
                variant="h3"
                fontWeight={600}
              >
                {lowStock}
              </Typography>

            </CardContent>

          </Card>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}
        >

          <Card>

            <CardContent>

              <Typography
                color="text.secondary"
              >
                Out of Stock
              </Typography>

              <Typography
                variant="h3"
                fontWeight={600}
              >
                {outOfStock}
              </Typography>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* ==================================================
          SEARCH
      ================================================== */}

      <Paper sx={{ p: 2 }}>

        <TextField
          fullWidth
          label="Search inventory"
          placeholder="Search by product, SKU or category..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </Paper>


      {/* ==================================================
          TABLE
      ================================================== */}

      <Paper>

        {loading ? (

          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ p: 8 }}
          >

            <CircularProgress />

          </Stack>

        ) : (

          <Stack
            sx={{
              overflowX: "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    Product
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    SKU
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    Category
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    Stock
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    Threshold
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "16px"
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      textAlign:
                        "right",
                      padding:
                        "16px"
                    }}
                  >
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredInventory.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "40px"
                      }}
                    >
                      No inventory found
                    </td>

                  </tr>

                ) : (

                  filteredInventory.map(
                    (item) => (

                      <tr
                        key={
                          item._id
                        }
                      >

                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >

                          <Typography
                            fontWeight={600}
                          >
                            {item.name}
                          </Typography>

                        </td>


                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >
                          {item.sku ||
                            "-"}
                        </td>


                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >
                          {item.category ||
                            "-"}
                        </td>


                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >

                          <Typography
                            fontWeight={600}
                          >
                            {item.stock}

                            {" "}

                            <Typography
                              component="span"
                              variant="caption"
                            >
                              {item.unit ||
                                "piece"}
                            </Typography>

                          </Typography>

                        </td>


                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >
                          {
                            item.lowStockThreshold
                          }
                        </td>


                        <td
                          style={{
                            padding:
                              "16px"
                          }}
                        >

                          {item.status ===
                          "IN_STOCK"
                            ? "In Stock"
                            : item.status ===
                                "LOW_STOCK"
                              ? "Low Stock"
                              : "Out of Stock"}

                        </td>


                        <td
                          style={{
                            padding:
                              "16px",
                            textAlign:
                              "right"
                          }}
                        >

                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <AddIcon />
                              }
                              onClick={() =>
                                openStockDialog(
                                  item,
                                  "IN"
                                )
                              }
                            >
                              Add
                            </Button>


                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={
                                <RemoveIcon />
                              }
                              disabled={
                                item.stock <=
                                0
                              }
                              onClick={() =>
                                openStockDialog(
                                  item,
                                  "OUT"
                                )
                              }
                            >
                              Remove
                            </Button>


                            <Button
                              size="small"
                              variant="text"
                              startIcon={
                                <HistoryIcon />
                              }
                              onClick={() =>
                                openHistory(
                                  item
                                )
                              }
                            >
                              History
                            </Button>

                          </Stack>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </Stack>

        )}

      </Paper>


      {/* ==================================================
          STOCK DIALOG
      ================================================== */}

      <Dialog
        open={stockDialog}
        onClose={
          closeStockDialog
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          {stockType === "IN"
            ? "Add Stock"
            : stockType === "OUT"
              ? "Remove Stock"
              : "Adjust Stock"}

        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >

            <Typography>

              Product:

              {" "}

              <strong>
                {
                  selectedProduct?.name
                }
              </strong>

            </Typography>


            <Typography
              color="text.secondary"
            >
              Current stock:{" "}
              {
                selectedProduct?.stock ??
                0
              }{" "}
              {
                selectedProduct?.unit ||
                "piece"
              }
            </Typography>


            <Select
              value={stockType}
              onChange={(e) =>
                setStockType(
                  e.target.value as
                    | "IN"
                    | "OUT"
                    | "ADJUSTMENT"
                )
              }
              fullWidth
            >

              <MenuItem value="IN">
                Add Stock
              </MenuItem>

              <MenuItem value="OUT">
                Remove Stock
              </MenuItem>

              <MenuItem value="ADJUSTMENT">
                Set Stock
              </MenuItem>

            </Select>


            <TextField
              fullWidth
              type="number"
              label={
                stockType ===
                "ADJUSTMENT"
                  ? "New Stock Quantity"
                  : "Quantity"
              }
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              slotProps={{
                htmlInput: {
                  min: 1
                }
              }}
            />


            <TextField
              fullWidth
              label="Reason"
              placeholder="Supplier delivery, damaged item..."
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
            />


            <TextField
              fullWidth
              label="Reference"
              placeholder="PO-1001"
              value={reference}
              onChange={(e) =>
                setReference(
                  e.target.value
                )
              }
            />

          </Stack>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              closeStockDialog
            }
            disabled={saving}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            color={
              stockType === "OUT"
                ? "error"
                : "primary"
            }
            onClick={
              handleStockSubmit
            }
            disabled={saving}
          >

            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Save"
            )}

          </Button>

        </DialogActions>

      </Dialog>


      {/* ==================================================
          HISTORY DIALOG
      ================================================== */}

      <Dialog
        open={historyDialog}
        onClose={() =>
          setHistoryDialog(false)
        }
        fullWidth
        maxWidth="md"
      >

        <DialogTitle>
          Stock History
        </DialogTitle>


        <DialogContent>

          {historyLoading ? (

            <Stack
              alignItems="center"
              sx={{ p: 5 }}
            >
              <CircularProgress />
            </Stack>

          ) : history.length ===
            0 ? (

            <Typography
              sx={{ p: 3 }}
              align="center"
            >
              No stock history found
            </Typography>

          ) : (

            <Stack spacing={2}>

              {history.map(
                (item) => (

                  <Paper
                    key={
                      item._id
                    }
                    sx={{
                      p: 2
                    }}
                  >

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >

                      <Typography
                        fontWeight={600}
                      >
                        {item.type ===
                        "IN"
                          ? "Stock Added"
                          : item.type ===
                              "OUT"
                            ? "Stock Removed"
                            : "Stock Adjusted"}
                      </Typography>

                      <Typography>
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </Typography>

                    </Stack>


                    <Typography>
                      Quantity:{" "}
                      {item.quantity}
                    </Typography>


                    <Typography>
                      Stock:{" "}
                      {
                        item.previousStock
                      }{" "}
                      →{" "}
                      {
                        item.newStock
                      }
                    </Typography>


                    {item.reason && (

                      <Typography
                        color="text.secondary"
                      >
                        Reason:{" "}
                        {item.reason}
                      </Typography>

                    )}


                    {item.reference && (

                      <Typography
                        color="text.secondary"
                      >
                        Reference:{" "}
                        {
                          item.reference
                        }
                      </Typography>

                    )}

                  </Paper>

                )
              )}

            </Stack>

          )}

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setHistoryDialog(
                false
              )
            }
          >
            Close
          </Button>

        </DialogActions>

      </Dialog>

    </Stack>
  );
};

export default Inventory;