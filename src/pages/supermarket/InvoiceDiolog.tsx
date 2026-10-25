import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceSaleItem {
  product?: string | { _id?: string; name?: string; sku?: string };
  name?: string;
  sku?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface InvoiceSale {
  _id: string;
  invoiceNumber: string;
  items: InvoiceSaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
}

interface InvoiceDialogProps {
  open: boolean;
  sale: InvoiceSale | null;
  onClose: () => void;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeTaxNumber?: string;
}

const money = (value: unknown) => {
  const amount = Number(value ?? 0);
  return (Number.isFinite(amount) ? amount : 0).toFixed(3);
};

const getItemName = (item: InvoiceSaleItem) => {
  if (item.name) return item.name;
  if (item.product && typeof item.product === "object") {
    return item.product.name || "Product";
  }
  return "Product";
};

const getItemSku = (item: InvoiceSaleItem) => {
  if (item.sku) return item.sku;
  if (item.product && typeof item.product === "object") {
    return item.product.sku || "-";
  }
  return "-";
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const InvoiceDialog = ({
  open,
  sale,
  onClose,
  storeName = "SUPERMART",
  storeAddress = "Oman",
  storePhone = "",
  storeTaxNumber = "",
}: InvoiceDialogProps) => {
  const [pdfError, setPdfError] = useState("");

  const invoiceDate = useMemo(() => {
    if (!sale?.createdAt) return new Date().toLocaleString();
    const date = new Date(sale.createdAt);
    return Number.isNaN(date.getTime())
      ? new Date().toLocaleString()
      : date.toLocaleString();
  }, [sale?.createdAt]);

  if (!sale) return null;

  const lineItems = sale.items || [];

  const buildPrintHtml = () => {
    const rows = lineItems
      .map((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const amount = Number(
          item.subtotal ?? qty * price
        );
        return `<tr>
          <td>${escapeHtml(getItemName(item))}</td>
          <td>${escapeHtml(getItemSku(item))}</td>
          <td class="num">${qty}</td>
          <td class="num">${money(price)}</td>
          <td class="num">${money(amount)}</td>
        </tr>`;
      })
      .join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${escapeHtml(sale.invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #20252b; margin: 0; padding: 28px; }
  .invoice { max-width: 900px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #252b33; padding-bottom: 18px; }
  h1 { margin: 0 0 6px; font-size: 26px; letter-spacing: 1px; }
  h2 { margin: 0; font-size: 22px; }
  .muted { color: #68717b; font-size: 12px; line-height: 1.6; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 22px 0; }
  .meta-box { border: 1px solid #d9dee4; border-radius: 6px; padding: 12px; }
  .label { color: #68717b; text-transform: uppercase; font-size: 10px; letter-spacing: .5px; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th { text-align: left; background: #f0f2f5; }
  th, td { padding: 10px 8px; border-bottom: 1px solid #d9dee4; }
  .num { text-align: right; white-space: nowrap; }
  .totals { width: 320px; max-width: 100%; margin: 18px 0 0 auto; }
  .total-row { display: flex; justify-content: space-between; gap: 20px; padding: 7px 0; }
  .grand { font-weight: 700; font-size: 18px; border-top: 2px solid #252b33; margin-top: 4px; padding-top: 12px; }
  .thanks { text-align: center; margin-top: 34px; border-top: 1px solid #d9dee4; padding-top: 16px; font-size: 12px; }
  @media print { body { padding: 0; } .invoice { max-width: none; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div>
      <h1>${escapeHtml(storeName)}</h1>
      <div class="muted">${escapeHtml(storeAddress)}</div>
      ${storePhone ? `<div class="muted">Phone: ${escapeHtml(storePhone)}</div>` : ""}
      ${storeTaxNumber ? `<div class="muted">Tax number: ${escapeHtml(storeTaxNumber)}</div>` : ""}
    </div>
    <div style="text-align:right">
      <h2>SALES INVOICE</h2>
      <div class="muted">Original receipt</div>
    </div>
  </div>
  <div class="meta">
    <div class="meta-box">
      <div class="label">Invoice number</div>
      <strong>${escapeHtml(sale.invoiceNumber)}</strong>
      <div class="muted" style="margin-top:8px">Date: ${escapeHtml(invoiceDate)}</div>
    </div>
    <div class="meta-box">
      <div class="label">Bill to</div>
      <strong>${escapeHtml(sale.customerName || "Walk-in Customer")}</strong>
      <div class="muted" style="margin-top:8px">Phone: ${escapeHtml(sale.customerPhone || "-")}</div>
      <div class="muted">Payment: ${escapeHtml(String(sale.paymentMethod || "-").toUpperCase())}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>SKU</th><th class="num">Qty</th><th class="num">Unit price (OMR)</th><th class="num">Amount (OMR)</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><strong>OMR ${money(sale.subtotal)}</strong></div>
    <div class="total-row"><span>Tax amount</span><strong>OMR ${money(sale.tax)}</strong></div>
    <div class="total-row grand"><span>Total</span><span>OMR ${money(sale.total)}</span></div>
  </div>
  <div class="thanks">Thank you for shopping with us!</div>
</div>
<script>window.onload = () => { window.focus(); window.print(); };</script>
</body>
</html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      setPdfError("The print window was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildPrintHtml());
    printWindow.document.close();
    setPdfError("");
  };

  const handleDownloadPdf = () => {
    try {
      setPdfError("");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const left = 15;
      const right = pageWidth - 15;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(storeName, left, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(storeAddress, left, 27);
      if (storePhone) doc.text(`Phone: ${storePhone}`, left, 32);
      if (storeTaxNumber) doc.text(`Tax number: ${storeTaxNumber}`, left, 37);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("SALES INVOICE", right, 20, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Invoice: ${sale.invoiceNumber}`, left, 48);
      doc.text(`Date: ${invoiceDate}`, left, 54);
      doc.text(`Customer: ${sale.customerName || "Walk-in Customer"}`, right, 48, {
        align: "right",
      });
      doc.text(`Phone: ${sale.customerPhone || "-"}`, right, 54, {
        align: "right",
      });
      doc.text(`Payment: ${String(sale.paymentMethod || "-").toUpperCase()}`, right, 60, {
        align: "right",
      });

      autoTable(doc, {
        startY: 68,
        head: [["Product", "SKU", "Qty", "Unit price (OMR)", "Amount (OMR)"]],
        body: lineItems.map((item) => [
          getItemName(item),
          getItemSku(item),
          String(Number(item.quantity) || 0),
          money(item.price),
          money(item.subtotal ?? Number(item.quantity) * Number(item.price)),
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [43, 52, 65] },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
      const totalsX = right - 65;
      let y = finalY + 12;

      doc.setFontSize(10);
      doc.text("Subtotal", totalsX, y);
      doc.text(`OMR ${money(sale.subtotal)}`, right, y, { align: "right" });
      y += 7;
      doc.text("Tax amount", totalsX, y);
      doc.text(`OMR ${money(sale.tax)}`, right, y, { align: "right" });
      y += 9;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Total", totalsX, y);
      doc.text(`OMR ${money(sale.total)}`, right, y, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Thank you for shopping with us!", pageWidth / 2, 280, {
        align: "center",
      });

      const safeInvoice = String(sale.invoiceNumber || "invoice").replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      doc.save(`${safeInvoice}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setPdfError("Could not create the PDF. Please try printing the invoice instead.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Sale completed
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Invoice {sale.invoiceNumber}
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>
            OMR {money(sale.total)}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {pdfError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setPdfError("")}>
            {pdfError}
          </Alert>
        )}

        <Box
          sx={{
            maxWidth: 760,
            mx: "auto",
            p: { xs: 1, sm: 3 },
            bgcolor: "background.paper",
            color: "text.primary",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {storeName}
              </Typography>
              <Typography color="text.secondary">{storeAddress}</Typography>
              {storePhone && (
                <Typography color="text.secondary">Phone: {storePhone}</Typography>
              )}
              {storeTaxNumber && (
                <Typography color="text.secondary">
                  Tax number: {storeTaxNumber}
                </Typography>
              )}
            </Box>
            <Box textAlign="right">
              <Typography variant="h6" fontWeight={700}>
                SALES INVOICE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoiceDate}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                INVOICE NUMBER
              </Typography>
              <Typography fontWeight={700}>{sale.invoiceNumber}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                CUSTOMER
              </Typography>
              <Typography fontWeight={700}>
                {sale.customerName || "Walk-in Customer"}
              </Typography>
              <Typography variant="body2">
                Phone: {sale.customerPhone || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                PAYMENT
              </Typography>
              <Typography fontWeight={700}>
                {String(sale.paymentMethod || "-").toUpperCase()}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f2f5", color: "#20252b" }}>
                  {["Product", "SKU", "Qty", "Unit price (OMR)", "Amount (OMR)"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: ["Qty", "Unit price (OMR)", "Amount (OMR)"].includes(
                            heading
                          )
                            ? "right"
                            : "left",
                          padding: 10,
                          borderBottom: "1px solid #d9dee4",
                          fontSize: 12,
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={`${getItemName(item)}-${index}`}>
                    <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>
                      {getItemName(item)}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>
                      {getItemSku(item)}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {money(item.price)}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {money(item.subtotal ?? Number(item.quantity) * Number(item.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Stack sx={{ maxWidth: 300, ml: "auto", mt: 3 }} spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>OMR {money(sale.subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tax amount</Typography>
              <Typography>OMR {money(sale.tax)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                OMR {money(sale.total)}
              </Typography>
            </Stack>
          </Stack>

          <Typography
            align="center"
            color="text.secondary"
            variant="body2"
            sx={{ mt: 4 }}
          >
            Thank you for shopping with us!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintOutlinedIcon />}
          onClick={handlePrint}
        >
          Print invoice
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfOutlinedIcon />}
          onClick={handleDownloadPdf}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;
