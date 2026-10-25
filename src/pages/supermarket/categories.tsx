import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Switch,
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
  getCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
} from "../../api/categoryApi";

// ======================================================
// TYPE
// ======================================================

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

// ======================================================
// FORM
// ======================================================

interface CategoryForm {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

// ======================================================
// EMPTY FORM
// ======================================================

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

// ======================================================
// COMPONENT
// ======================================================

const Categories = () => {
  const [categories, setCategories] =
    useState<Category[]>([]);

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
    useState<CategoryForm>(emptyForm);

  // ====================================================
  // LOAD CATEGORIES
  // ====================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getCategoriesAPI();

      console.log(
        "Categories response:",
        data
      );

      const categoryList =
        data?.categories ||
        data?.data?.categories ||
        data?.data ||
        [];

      setCategories(
        Array.isArray(categoryList)
          ? categoryList
          : []
      );
    } catch (err: any) {
      console.error(
        "Get categories error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ====================================================
  // OPEN ADD
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
  // OPEN EDIT
  // ====================================================

  const handleEdit = (
    category: Category
  ) => {
    setEditMode(true);
    setSelectedId(category._id);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      image: category.image || "",
      isActive:
        category.isActive !== false,
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
  // FORM CHANGE
  // ====================================================

  const handleChange = (
    field: keyof CategoryForm,
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

      if (!form.name.trim()) {
        setError(
          "Category name is required"
        );
        return;
      }

      const categoryData = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        image: form.image.trim(),
        isActive: form.isActive,
      };

      console.log(
        "Category data:",
        categoryData
      );

      // UPDATE
      if (
        editMode &&
        selectedId
      ) {
        await updateCategoryAPI(
          selectedId,
          categoryData
        );

        setSuccess(
          "Category updated successfully"
        );
      }

      // CREATE
      else {
        await createCategoryAPI(
          categoryData
        );

        setSuccess(
          "Category created successfully"
        );
      }

      setOpenDialog(false);
      setForm(emptyForm);
      setSelectedId(null);
      setEditMode(false);

      await loadCategories();
    } catch (err: any) {
      console.error(
        "Save category error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save category"
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
        "Are you sure you want to delete this category?"
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteCategoryAPI(id);

      setCategories(
        (previous) =>
          previous.filter(
            (category) =>
              category._id !== id
          )
      );

      setSuccess(
        "Category deleted successfully"
      );
    } catch (err: any) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete category"
      );
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredCategories =
    categories.filter((category) => {
      const text =
        search.toLowerCase();

      return (
        category.name
          .toLowerCase()
          .includes(text) ||
        category.description
          ?.toLowerCase()
          .includes(text)
      );
    });

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
            Categories
          </Typography>

          <Typography
            color="text.secondary"
          >
            Manage supermarket product
            categories
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Category
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
          label="Search categories"
          placeholder="Search category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
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
                    Category
                  </strong>
                </TableCell>

                <TableCell>
                  <strong>
                    Description
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

              {filteredCategories.length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map(
                  (category) => (
                    <TableRow
                      key={category._id}
                      hover
                    >

                      <TableCell>
                        <Typography
                          fontWeight={600}
                        >
                          {category.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {category.description ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {category.isActive ===
                        false
                          ? "Inactive"
                          : "Active"}
                      </TableCell>

                      <TableCell align="right">

                        <Button
                          size="small"
                          startIcon={
                            <EditIcon />
                          }
                          onClick={() =>
                            handleEdit(
                              category
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
                              category._id
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
        maxWidth="sm"
      >

        <DialogTitle>
          {editMode
            ? "Edit Category"
            : "Add Category"}
        </DialogTitle>

        <DialogContent>

          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >

            <TextField
              fullWidth
              label="Category Name"
              value={form.name}
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value
                )
              }
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={
                form.description
              }
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
            />

            <TextField
              fullWidth
              label="Image URL"
              placeholder="https://..."
              value={form.image}
              onChange={(e) =>
                handleChange(
                  "image",
                  e.target.value
                )
              }
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >

              <Typography>
                Active
              </Typography>

              <Switch
                checked={
                  form.isActive
                }
                onChange={(e) =>
                  handleChange(
                    "isActive",
                    e.target.checked
                  )
                }
              />

            </Stack>

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
              "Update Category"
            ) : (
              "Add Category"
            )}
          </Button>

        </DialogActions>

      </Dialog>

    </Stack>
  );
};

export default Categories;