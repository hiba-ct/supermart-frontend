
import { useEffect, useState } from 'react';
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
import { getEmployeesAPI, addEmployeeAPI } from '../../api/employeeApi';

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  jobRole: string;
  joiningDate: string;
  employmentStatus: 'Active' | 'Inactive';
}

const initialForm = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  department: 'Sales',
  jobRole: 'Cashier',
  joiningDate: new Date().toISOString().slice(0, 10)
};

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployeesAPI();
      const data = response?.data ?? response;
      setEmployees(data.employees ?? []);
    } catch {
      setError('Could not load employees. Check your server and API configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSave = async () => {
    setError('');

    if (
      !form.employeeId.trim() ||
      !form.name.trim() ||
      !form.department.trim() ||
      !form.jobRole.trim() ||
      !form.joiningDate
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      await addEmployeeAPI(form);
      setOpen(false);
      setForm(initialForm);
      await loadEmployees();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to add employee.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = employees.filter(
    (employee) => employee.employmentStatus === 'Active'
  ).length;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Employee Management
          </Typography>
          <Typography color="text.secondary">
            Manage supermarket employees and their details.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => {
          setError('');
          setForm(initialForm);
          setOpen(true);
        }}>
          + Add Employee
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Employees', value: employees.length },
          { label: 'Active Employees', value: activeCount },
          { label: 'Inactive Employees', value: employees.length - activeCount }
        ].map((item) => (
          <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography color="text.secondary" variant="body2">
                {item.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Employee List
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Job Role</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow hover key={employee._id}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{employee.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.email || employee.phone || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.jobRole}</TableCell>
                    <TableCell>
                      {new Date(employee.joiningDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={employee.employmentStatus}
                        color={
                          employee.employmentStatus === 'Active'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!employees.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      No employees found. Click Add Employee to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Employee ID"
              required
              value={form.employeeId}
              onChange={(e) =>
                setForm({ ...form, employeeId: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Department"
              required
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              fullWidth
            >
              {['Sales', 'Inventory', 'Accounts', 'Management', 'Delivery'].map(
                (department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              label="Job Role"
              required
              value={form.jobRole}
              onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              fullWidth
            >
              {[
                'Cashier',
                'Storekeeper',
                'Sales Assistant',
                'Manager',
                'Accountant',
                'Delivery Staff'
              ].map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Joining Date"
              type="date"
              required
              value={form.joiningDate}
              onChange={(e) =>
                setForm({ ...form, joiningDate: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
