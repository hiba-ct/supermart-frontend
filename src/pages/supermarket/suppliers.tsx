import { useEffect, useState } from "react";

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
import EditIcon from "@mui/icons-material/Edit";

import {
  getSuppliersAPI,
  createSupplierAPI,
  updateSupplierAPI,
  deleteSupplierAPI,
} from "../../api/supplierApi";

// ======================================================
// TYPES
// ======================================================

interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  paymentTerms?: string;
  isActive?: boolean;
  notes?: string;
}

interface SupplierForm {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  vatNumber: string;
  paymentTerms: string;
  isActive: boolean;
  notes: string;
}

const emptyForm: SupplierForm = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Oman",
  vatNumber: "",
  paymentTerms: "Cash",
  isActive: true,
  notes: "",
};

// ======================================================
// COMPONENT
// ======================================================

const Suppliers = () => {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<SupplierForm>(emptyForm);

  // ====================================================
  // LOAD
  // ====================================================

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getSuppliersAPI();

      console.log(
        "Suppliers response:",
        data
      );

      const list =
        data?.suppliers ||
        data?.data?.suppliers ||
        data?.data ||
        [];

      setSuppliers(
        Array.isArray(list)
          ? list
          : []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ====================================================
  // ADD
  // ====================================================

  const handleAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setOpenDialog(true);
  };

  // ====================================================
  // EDIT
  // ====================================================

  const handleEdit = (
    supplier: Supplier
  ) => {
    setEditMode(true);
    setSelectedId(supplier._id);

    setForm({
      companyName:
        supplier.companyName || "",
      contactPerson:
        supplier.contactPerson || "",
      phone:
        supplier.phone || "",
      email:
        supplier.email || "",
      address:
        supplier.address || "",
      city:
        supplier.city || "",
      country:
        supplier.country || "Oman",
      vatNumber:
        supplier.vatNumber || "",
      paymentTerms:
        supplier.paymentTerms || "Cash",
      isActive:
        supplier.isActive !== false,
      notes:
        supplier.notes || "",
    });

    setError("");
    setSuccess("");
    setOpenDialog(true);
  };

  // ====================================================
  // CLOSE
  // ====================================================

  const handleClose = () => {
    if (saving) return;

    setOpenDialog(false);
    setSelectedId(null);
    setEditMode(false);
    setForm(emptyForm);
  };

  // ====================================================
  // CHANGE
  // ====================================================

  const handleChange = (
    field: keyof SupplierForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ====================================================
  // SAVE
  // ====================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.companyName.trim()) {
        setError(
          "Company name is required"
        );
        return;
      }

      if (!form.contactPerson.trim()) {
        setError(
          "Contact person is required"
        );
        return;
      }

      if (!form.phone.trim()) {
        setError(
          "Phone number is required"
        );
        return;
      }

      const supplierData = {
        companyName:
          form.companyName.trim(),

        contactPerson:
          form.contactPerson.trim(),

        phone:
          form.phone.trim(),

        email:
          form.email.trim(),

        address:
          form.address.trim(),

        city:
          form.city.trim(),

        country:
          form.country.trim(),

        vatNumber:
          form.vatNumber.trim(),

        paymentTerms:
          form.paymentTerms,

        isActive:
          form.isActive,

        notes:
          form.notes.trim(),
      };

      if (
        editMode &&
        selectedId
      ) {
        await updateSupplierAPI(
          selectedId,
          supplierData
        );

        setSuccess(
          "Supplier updated successfully"
        );
      } else {
        await createSupplierAPI(
          supplierData
        );

        setSuccess(
          "Supplier created successfully"
        );
      }

      setOpenDialog(false);
      setForm(emptyForm);
      setSelectedId(null);
      setEditMode(false);

      await loadSuppliers();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save supplier"
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this supplier?"
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteSupplierAPI(id);

      setSuppliers(
        (previous) =>
          previous.filter(
            (supplier) =>
              supplier._id !== id
          )
      );

      setSuccess(
        "Supplier deleted successfully"
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete supplier"
      );
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredSuppliers =
    suppliers.filter(
      (supplier) => {
        const text =
          search.toLowerCase();

        return (
          supplier.companyName
            ?.toLowerCase()
            .includes(text) ||
          supplier.contactPerson
            ?.toLowerCase()
            .includes(text) ||
          supplier.phone
            ?.toLowerCase()
            .includes(text) ||
          supplier.city
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
            Suppliers
          </Typography>

          <Typography color="text.secondary">
            Manage supermarket suppliers
            and vendor information
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Supplier
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
          label="Search suppliers"
          placeholder="Company, contact person, phone or city..."
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
                    Company
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Contact
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Phone
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    City
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Payment Terms
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

              {filteredSuppliers.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                  >
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map(
                  (supplier) => (
                    <TableRow
                      key={
                        supplier._id
                      }
                      hover
                    >

                      <TableCell>

                        <Typography
                          fontWeight={600}
                        >
                          {
                            supplier.companyName
                          }
                        </Typography>

                        {supplier.email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              supplier.email
                            }
                          </Typography>
                        )}

                      </TableCell>

                      <TableCell>
                        {
                          supplier.contactPerson
                        }
                      </TableCell>

                      <TableCell>
                        {
                          supplier.phone
                        }
                      </TableCell>

                      <TableCell>
                        {
                          supplier.city ||
                          "-"
                        }
                      </TableCell>

                      <TableCell>
                        {
                          supplier.paymentTerms ||
                          "Cash"
                        }
                      </TableCell>

                      <TableCell>
                        {
                          supplier.isActive ===
                          false
                            ? "Inactive"
                            : "Active"
                        }
                      </TableCell>

                      <TableCell align="right">

                        <Button
                          size="small"
                          startIcon={
                            <EditIcon />
                          }
                          onClick={() =>
                            handleEdit(
                              supplier
                            )
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          startIcon={
                            <DeleteIcon />
                          }
                          onClick={() =>
                            handleDelete(
                              supplier._id
                            )
                          }
                        >
                          Delete
                        </Button>

                      </TableCell>

                    </TableRow>
                  )
                )
              )}

            </TableBody>

          </Table>
        )}
      </TableContainer>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >

        <DialogTitle>
          {editMode
            ? "Edit Supplier"
            : "Add Supplier"}
        </DialogTitle>

        <DialogContent>

          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >

            <TextField
              fullWidth
              label="Company Name"
              value={
                form.companyName
              }
              onChange={(e) =>
                handleChange(
                  "companyName",
                  e.target.value
                )
              }
              required
            />

            <TextField
              fullWidth
              label="Contact Person"
              value={
                form.contactPerson
              }
              onChange={(e) =>
                handleChange(
                  "contactPerson",
                  e.target.value
                )
              }
              required
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="Phone"
                value={
                  form.phone
                }
                onChange={(e) =>
                  handleChange(
                    "phone",
                    e.target.value
                  )
                }
                required
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={
                  form.email
                }
                onChange={(e) =>
                  handleChange(
                    "email",
                    e.target.value
                  )
                }
              />

            </Stack>

            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={
                form.address
              }
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="City"
                value={
                  form.city
                }
                onChange={(e) =>
                  handleChange(
                    "city",
                    e.target.value
                  )
                }
              />

              <TextField
                fullWidth
                label="Country"
                value={
                  form.country
                }
                onChange={(e) =>
                  handleChange(
                    "country",
                    e.target.value
                  )
                }
              />

            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="VAT Number"
                value={
                  form.vatNumber
                }
                onChange={(e) =>
                  handleChange(
                    "vatNumber",
                    e.target.value
                  )
                }
              />

              <FormControl fullWidth>

                <InputLabel>
                  Payment Terms
                </InputLabel>

                <Select
                  value={
                    form.paymentTerms
                  }
                  label="Payment Terms"
                  onChange={(e) =>
                    handleChange(
                      "paymentTerms",
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="Cash">
                    Cash
                  </MenuItem>

                  <MenuItem value="7 Days">
                    7 Days
                  </MenuItem>

                  <MenuItem value="15 Days">
                    15 Days
                  </MenuItem>

                  <MenuItem value="30 Days">
                    30 Days
                  </MenuItem>

                  <MenuItem value="60 Days">
                    60 Days
                  </MenuItem>

                </Select>

              </FormControl>

            </Stack>

            <FormControl fullWidth>

              <InputLabel>
                Status
              </InputLabel>

              <Select
                value={
                  form.isActive
                    ? "active"
                    : "inactive"
                }
                label="Status"
                onChange={(e) =>
                  handleChange(
                    "isActive",
                    e.target.value ===
                      "active"
                  )
                }
              >

                <MenuItem value="active">
                  Active
                </MenuItem>

                <MenuItem value="inactive">
                  Inactive
                </MenuItem>

              </Select>

            </FormControl>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={
                form.notes
              }
              onChange={(e) =>
                handleChange(
                  "notes",
                  e.target.value
                )
              }
            />

          </Stack>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >

            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : editMode ? (
              "Update Supplier"
            ) : (
              "Add Supplier"
            )}

          </Button>

        </DialogActions>

      </Dialog>

    </Stack>
  );
};

export default Suppliers;