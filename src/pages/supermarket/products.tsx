import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import {
  getProductsAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI
} from '../../api/productApi';

import { getCategoriesAPI } from '../../api/categoryApi';
import { getSuppliersAPI } from '../../api/supplierApi';

interface Product {
  _id: string;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  unit?: string;
  supplier?: string;
  isActive?: boolean;
}

interface CategoryOption {
  _id: string;
  name?: string;
  categoryName?: string;
  title?: string;
  [key: string]: unknown;
}

interface SupplierOption {
  _id: string;
  name?: string;
  supplierName?: string;
  companyName?: string;
  [key: string]: unknown;
}

interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  lowStockThreshold: string;
  unit: string;
  supplier: string;
  isActive: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  purchasePrice: '',
  sellingPrice: '',
  stock: '0',
  lowStockThreshold: '10',
  unit: 'piece',
  supplier: '',
  isActive: true
};

function getList<T>(response: any, keys: string[]): T[] {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

const getCategoryName = (category: CategoryOption) =>
  String(category.name ?? category.categoryName ?? category.title ?? '');

const getSupplierName = (supplier: SupplierOption) =>
  String(supplier.name ?? supplier.supplierName ?? supplier.companyName ?? '');

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductsAPI();
      setProducts(getList<Product>(response, ['products']));
      setError('');
    } catch (err: any) {
      console.error('Get products error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDropdownOptions = useCallback(async () => {
    try {
      setOptionsLoading(true);
      const [categoryResponse, supplierResponse] = await Promise.all([
        getCategoriesAPI(),
        getSuppliersAPI()
      ]);

      const categoryList = getList<CategoryOption>(categoryResponse, ['categories']);
      const supplierList = getList<SupplierOption>(supplierResponse, ['suppliers']);

      setCategories(categoryList.filter((item) => getCategoryName(item)));
      setSuppliers(supplierList.filter((item) => getSupplierName(item)));
    } catch (err: any) {
      console.error('Load category/supplier options error:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Could not load categories and suppliers. Check that you are logged in and the APIs are available.'
      );
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadDropdownOptions();
  }, [loadProducts, loadDropdownOptions]);

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddProduct = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setOpenDialog(true);
    void loadDropdownOptions();
  };

  const handleEditProduct = (product: Product) => {
    setEditMode(true);
    setSelectedId(product._id);
    setForm({
      name: product.name ?? '',
      sku: product.sku ?? '',
      description: product.description ?? '',
      category: product.category ?? '',
      purchasePrice: product.purchasePrice != null ? String(product.purchasePrice) : '',
      sellingPrice: product.sellingPrice != null ? String(product.sellingPrice) : '',
      stock: product.stock != null ? String(product.stock) : '0',
      lowStockThreshold: product.lowStockThreshold != null ? String(product.lowStockThreshold) : '10',
      unit: product.unit ?? 'piece',
      supplier: product.supplier ?? '',
      isActive: product.isActive !== false
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
    void loadDropdownOptions();
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setOpenDialog(false);
    setForm(emptyForm);
    setSelectedId(null);
    setEditMode(false);
  };

  const handleSaveProduct = async () => {
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.category) {
      setError('Please select a category.');
      return;
    }
    if (!form.sellingPrice || Number(form.sellingPrice) < 0) {
      setError('Enter a valid selling price.');
      return;
    }
    if (Number(form.purchasePrice || 0) < 0 || Number(form.stock || 0) < 0) {
      setError('Purchase price and stock cannot be negative.');
      return;
    }
    if (Number(form.lowStockThreshold || 0) < 0) {
      setError('Low-stock threshold cannot be negative.');
      return;
    }

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      // This keeps the product API's existing name-based string fields.
      // If your backend expects MongoDB ObjectIds, change these values to IDs.
      category: form.category,
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      stock: Number(form.stock || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 10),
      unit: form.unit,
      supplier: form.supplier,
      isActive: form.isActive
    };

    try {
      setSaving(true);
      if (editMode && selectedId) {
        await updateProductAPI(selectedId, productData);
        setSuccess('Product updated successfully.');
      } else {
        await createProductAPI(productData);
        setSuccess('Product added successfully.');
      }

      setOpenDialog(false);
      setForm(emptyForm);
      setSelectedId(null);
      setEditMode(false);
      await loadProducts();
    } catch (err: any) {
      console.error('Save product error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setError('');
      setSuccess('');
      await deleteProductAPI(id);
      setProducts((current) => current.filter((product) => product._id !== id));
      setSuccess('Product deleted successfully.');
    } catch (err: any) {
      console.error('Delete product error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.sku?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.supplier?.toLowerCase().includes(searchText)
    );
  });

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <div>
          <Typography variant="h4" fontWeight={700}>Products</Typography>
          <Typography color="text.secondary">Manage supermarket products, pricing and stock.</Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct}>
          Add Product
        </Button>
      </Stack>

      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search products"
          placeholder="Search by name, SKU, category or supplier..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ p: 8 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Supplier</strong></TableCell>
                <TableCell><strong>Price (OMR)</strong></TableCell>
                <TableCell><strong>Stock</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">No products found.</TableCell></TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stock = Number(product.stock ?? 0);
                  const threshold = Number(product.lowStockThreshold ?? 10);
                  const isLowStock = stock <= threshold;
                  return (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{product.name}</Typography>
                        {product.description && <Typography variant="caption" color="text.secondary">{product.description}</Typography>}
                      </TableCell>
                      <TableCell>{product.sku || '—'}</TableCell>
                      <TableCell>{product.category || '—'}</TableCell>
                      <TableCell>{product.supplier || '—'}</TableCell>
                      <TableCell>{Number(product.sellingPrice ?? 0).toFixed(3)}</TableCell>
                      <TableCell>
                        {stock}
                        {isLowStock && (
                          <Typography variant="caption" color="error" display="block">
                            Low stock (threshold: {threshold})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{product.isActive === false ? 'Inactive' : 'Active'}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditProduct(product)}>Edit</Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete(product._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth required label="Product Name"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            <TextField
              fullWidth label="SKU"
              value={form.sku}
              onChange={(event) => handleChange('sku', event.target.value)}
            />
            <TextField
              fullWidth multiline minRows={2} label="Description"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
            />

            <FormControl fullWidth required disabled={optionsLoading}>
              <InputLabel id="product-category-label">Category</InputLabel>
              <Select
                labelId="product-category-label"
                label="Category"
                value={form.category}
                onChange={(event) => handleChange('category', event.target.value)}
              >
                {categories.map((category) => {
                  const name = getCategoryName(category);
                  return <MenuItem key={category._id} value={name}>{name}</MenuItem>;
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={optionsLoading}>
              <InputLabel id="product-supplier-label">Supplier</InputLabel>
              <Select
                labelId="product-supplier-label"
                label="Supplier"
                value={form.supplier}
                onChange={(event) => handleChange('supplier', event.target.value)}
              >
                <MenuItem value="">No supplier selected</MenuItem>
                {suppliers.map((supplier) => {
                  const name = getSupplierName(supplier);
                  return <MenuItem key={supplier._id} value={name}>{name}</MenuItem>;
                })}
              </Select>
            </FormControl>

            {optionsLoading && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">Loading categories and suppliers…</Typography>
              </Stack>
            )}

            {!optionsLoading && categories.length === 0 && (
              <Alert severity="warning">No categories found. Add a category in Category Management first.</Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth type="number" label="Purchase Price (OMR)"
                inputProps={{ min: 0, step: '0.001' }}
                value={form.purchasePrice}
                onChange={(event) => handleChange('purchasePrice', event.target.value)}
              />
              <TextField
                fullWidth required type="number" label="Selling Price (OMR)"
                inputProps={{ min: 0, step: '0.001' }}
                value={form.sellingPrice}
                onChange={(event) => handleChange('sellingPrice', event.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth type="number" label="Stock Quantity"
                inputProps={{ min: 0, step: 1 }}
                value={form.stock}
                onChange={(event) => handleChange('stock', event.target.value)}
              />
              <TextField
                fullWidth type="number" label="Low Stock Threshold"
                inputProps={{ min: 0, step: 1 }}
                value={form.lowStockThreshold}
                onChange={(event) => handleChange('lowStockThreshold', event.target.value)}
                helperText="Show a low-stock warning at or below this quantity."
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="product-unit-label">Unit</InputLabel>
              <Select
                labelId="product-unit-label"
                label="Unit"
                value={form.unit}
                onChange={(event) => handleChange('unit', event.target.value)}
              >
                <MenuItem value="piece">Piece</MenuItem>
                <MenuItem value="pack">Pack</MenuItem>
                <MenuItem value="kg">Kilogram (kg)</MenuItem>
                <MenuItem value="g">Gram (g)</MenuItem>
                <MenuItem value="liter">Liter (L)</MenuItem>
                <MenuItem value="ml">Milliliter (ml)</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="carton">Carton</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(event) => handleChange('isActive', event.target.checked)}
                />
              }
              label="Active product"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveProduct()} disabled={saving || optionsLoading}>
            {saving ? <CircularProgress size={22} color="inherit" /> : editMode ? 'Update Product' : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Products;
