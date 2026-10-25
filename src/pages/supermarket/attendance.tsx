
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
} from "@mui/material";

import { getEmployeesAPI } from "../../api/employeeApi";
import {
  getDailyAttendanceAPI,
  markAttendanceAPI,
} from "../../api/attendanceApi";

type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";
type EditableStatus = AttendanceStatus | "";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  jobRole: string;
  employmentStatus: string;
}

interface AttendanceRecord {
  employee: Employee | string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface AttendanceRow {
  employee: Employee;
  status: EditableStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
  saved: boolean;
  saving: boolean;
}

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyRow = (employee: Employee): AttendanceRow => ({
  employee,
  status: "",
  checkIn: "",
  checkOut: "",
  notes: "",
  saved: false,
  saving: false,
});

const statusColor = (
  status: AttendanceStatus
): "success" | "error" | "warning" | "info" => {
  switch (status) {
    case "Present":
      return "success";
    case "Absent":
      return "error";
    case "Late":
      return "warning";
    default:
      return "info";
  }
};

export default function Attendance() {
  const [date, setDate] = useState(getLocalDate());
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [employeeResponse, attendanceResponse] = await Promise.all([
        getEmployeesAPI(),
        getDailyAttendanceAPI(date),
      ]);

      const employees: Employee[] = (
        employeeResponse?.employees ?? []
      ).filter(
        (employee: Employee) =>
          employee.employmentStatus === "Active"
      );

      const records: AttendanceRecord[] =
        attendanceResponse?.attendance ?? [];

      const recordMap = new Map<string, AttendanceRecord>();

      records.forEach((record) => {
        const employeeId =
          typeof record.employee === "string"
            ? record.employee
            : record.employee?._id;

        if (employeeId) recordMap.set(employeeId, record);
      });

      setRows(
        employees.map((employee) => {
          const record = recordMap.get(employee._id);

          return {
            ...emptyRow(employee),
            status: record?.status ?? "",
            checkIn: record?.checkIn ?? "",
            checkOut: record?.checkOut ?? "",
            notes: record?.notes ?? "",
            saved: Boolean(record),
          };
        })
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const updateRow = (
    employeeId: string,
    field: "status" | "checkIn" | "checkOut" | "notes",
    value: string
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.employee._id !== employeeId) return row;

        const updated = { ...row, [field]: value };

        if (field === "status" &&
            (value === "Absent" || value === "On Leave")) {
          updated.checkIn = "";
          updated.checkOut = "";
        }

        return updated;
      })
    );
  };

  const saveRow = async (employeeId: string) => {
    const row = rows.find(
      (item) => item.employee._id === employeeId
    );

    if (!row || !row.status) {
      setError("Select an attendance status before saving.");
      return;
    }

    if (
      row.checkIn &&
      row.checkOut &&
      row.checkOut <= row.checkIn
    ) {
      setError("Check-out must be later than check-in.");
      return;
    }

    setError("");
    setMessage("");

    setRows((current) =>
      current.map((item) =>
        item.employee._id === employeeId
          ? { ...item, saving: true }
          : item
      )
    );

    try {
      await markAttendanceAPI({
        employeeId: row.employee._id,
        attendanceDate: date,
        status: row.status,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        notes: row.notes,
      });

      setRows((current) =>
        current.map((item) =>
          item.employee._id === employeeId
            ? { ...item, saved: true }
            : item
        )
      );

      setMessage(`Attendance saved for ${row.employee.name}.`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Unable to save attendance. Please try again."
      );
    } finally {
      setRows((current) =>
        current.map((item) =>
          item.employee._id === employeeId
            ? { ...item, saving: false }
            : item
        )
      );
    }
  };

  const savedRows = rows.filter((row) => row.saved);
  const countStatus = (status: AttendanceStatus) =>
    savedRows.filter((row) => row.status === status).length;

  const summary = [
    { label: "Active Employees", value: rows.length },
    { label: "Present", value: countStatus("Present") },
    { label: "Absent", value: countStatus("Absent") },
    { label: "Late", value: countStatus("Late") },
    { label: "On Leave", value: countStatus("On Leave") },
  ];
  
const downloadAttendanceCSV = () => {
  const headers = [
    "Date",
    "Employee ID",
    "Employee Name",
    "Department",
    "Job Role",
    "Status",
    "Check In",
    "Check Out",
    "Notes",
  ];

  const escapeCSV = (value: unknown) => {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const data = rows.map((row) => [
    date,
    row.employee.employeeId,
    row.employee.name,
    row.employee.department,
    row.employee.jobRole,
    row.status || "Not Marked",
    row.checkIn,
    row.checkOut,
    row.notes,
  ]);

  const csv = [
    headers.map(escapeCSV).join(","),
    ...data.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  // Excel-compatible UTF-8 CSV.
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `attendance-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};


  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Daily Attendance
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Record and review employee attendance.
          </Typography>
        </Box>

       
<Stack direction="row" spacing={1} flexWrap="wrap">
  <Button
    variant="outlined"
    onClick={downloadAttendanceCSV}
    disabled={loading || rows.length === 0}
  >
    Download CSV
  </Button>

  <Button
    variant="outlined"
    onClick={loadAttendance}
    disabled={loading}
  >
    Refresh
  </Button>
</Stack>

      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Attendance Sheet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a work date to load or record attendance.
            </Typography>
          </Box>

          <TextField
            label="Attendance Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: getLocalDate() }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {summary.map((item) => (
          <Paper
            variant="outlined"
            key={item.label}
            sx={{ p: 2, borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Employee Attendance List
          </Typography>
          <Chip
            label={`${savedRows.length} of ${rows.length} saved`}
            color={
              savedRows.length === rows.length ? "success" : "default"
            }
            size="small"
          />
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Alert severity="info">
            No active employees found. Add employees first.
          </Alert>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.employee._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {row.employee.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.employee.employeeId}
                      </Typography>
                    </TableCell>

                    <TableCell>{row.employee.department}</TableCell>

                    <TableCell sx={{ minWidth: 155 }}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={row.status}
                        onChange={(event) =>
                          updateRow(
                            row.employee._id,
                            "status",
                            event.target.value
                          )
                        }
                      >
                        <MenuItem value="">Not marked</MenuItem>
                        {(
                          ["Present", "Absent", "Late", "On Leave"] as const
                        ).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>

                      {row.saved && row.status && (
                        <Chip
                          size="small"
                          color={statusColor(row.status)}
                          label="Saved"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        value={row.checkIn}
                        disabled={
                          row.status === "Absent" ||
                          row.status === "On Leave"
                        }
                        onChange={(event) =>
                          updateRow(
                            row.employee._id,
                            "checkIn",
                            event.target.value
                          )
                        }
                        inputProps={{ step: 300 }}
                        sx={{ minWidth: 125 }}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="time"
                        size="small"
                        value={row.checkOut}
                        disabled={
                          row.status === "Absent" ||
                          row.status === "On Leave"
                        }
                        onChange={(event) =>
                          updateRow(
                            row.employee._id,
                            "checkOut",
                            event.target.value
                          )
                        }
                        inputProps={{ step: 300 }}
                        sx={{ minWidth: 125 }}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={row.notes}
                        placeholder="Optional"
                        inputProps={{ maxLength: 500 }}
                        onChange={(event) =>
                          updateRow(
                            row.employee._id,
                            "notes",
                            event.target.value
                          )
                        }
                        sx={{ minWidth: 130 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={row.saving || !row.status}
                        onClick={() => saveRow(row.employee._id)}
                      >
                        {row.saving
                          ? "Saving..."
                          : row.saved
                            ? "Update"
                            : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
