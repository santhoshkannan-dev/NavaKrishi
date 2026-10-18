export const SHIPPING_ADDRESS_STORAGE_KEY = "navakrishi_checkout_shipping_address";
export const LAST_ORDER_STORAGE_KEY = "navakrishi_last_order";
export const LAST_ORDER_ID_STORAGE_KEY = "navakrishi_last_order_id";

export const GST_RATE = 0.05;

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const loadSavedShippingAddress = () => {
  if (typeof window === "undefined") return null;

  return safeJsonParse(window.localStorage.getItem(SHIPPING_ADDRESS_STORAGE_KEY), null);
};

export const saveShippingAddress = (address) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SHIPPING_ADDRESS_STORAGE_KEY, JSON.stringify(address));
};

export const loadSavedOrder = () => {
  if (typeof window === "undefined") return null;

  return safeJsonParse(window.localStorage.getItem(LAST_ORDER_STORAGE_KEY), null);
};

export const saveOrderSnapshot = (order) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
};

export const saveOrderId = (orderId) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LAST_ORDER_ID_STORAGE_KEY, String(orderId));
};

export const loadOrderId = () => {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(LAST_ORDER_ID_STORAGE_KEY);
};

export const normalizeCartItems = (items = []) =>
  items.map((item) => {
    const product = item.product || {};
    const unitPrice = Number(product.price || 0);
    const quantity = Number(item.quantity || 0);

    return {
      id: item.id,
      title: product.title || "Product",
      image: product.image || product.images?.[0]?.image || "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
      farmerName: product.farmer?.first_name || product.farmer?.username || "NavaKrishi Farmer",
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      unit: product.unit || "item",
    };
  });

export const buildInvoiceHtml = (order) => {
  const shipping = order.shippingAddress || {};
  const items = order.items || [];
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-title">${item.title || item.product_title || "Product"}</div>
            <div class="item-meta">${item.quantity} ${item.unit || item.product_unit || "item"} @ ${currency.format(item.unitPrice ?? item.unit_price ?? 0)}</div>
          </td>
          <td class="right">${currency.format(item.lineTotal ?? item.total_price ?? 0)}</td>
        </tr>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${order.invoiceNumber} - NavaKrishi Invoice</title>
    <style>
      :root {
        --green: #1f6d1a;
        --deep: #012d1d;
        --muted: #5c6b63;
        --line: #dfe7e1;
        --soft: #f6faf5;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px;
        background: linear-gradient(180deg, #f4fff2 0%, #ffffff 40%);
        color: var(--deep);
        font-family: Arial, Helvetica, sans-serif;
      }
      .page {
        max-width: 960px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 80px rgba(1, 45, 29, 0.12);
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding: 32px;
        background: linear-gradient(135deg, var(--deep), #0c462e);
        color: #fff;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .mark {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: #a4f792;
        color: var(--deep);
        display: grid;
        place-items: center;
        font-weight: 900;
        font-size: 22px;
      }
      h1, h2, h3, p { margin: 0; }
      .brand h1 { font-size: 28px; }
      .brand p, .muted { color: rgba(255,255,255,0.75); }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 28px;
        min-width: 320px;
      }
      .meta-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(255,255,255,0.65);
      }
      .meta-value { margin-top: 6px; font-weight: 700; }
      .content { padding: 32px; }
      .summary {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .card {
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 22px;
      }
      .section-title {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--green);
        margin-bottom: 10px;
        font-weight: 700;
      }
      .address {
        line-height: 1.7;
        color: var(--muted);
        white-space: pre-line;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
      }
      th, td {
        padding: 14px 0;
        border-bottom: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
      }
      th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .right { text-align: right; white-space: nowrap; }
      .item-title { font-weight: 700; }
      .item-meta { font-size: 13px; color: var(--muted); margin-top: 4px; }
      .totals {
        margin-top: 22px;
        margin-left: auto;
        width: min(360px, 100%);
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 20px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
        color: var(--muted);
      }
      .totals-row.total {
        color: var(--deep);
        font-size: 20px;
        font-weight: 800;
        padding-top: 12px;
        border-top: 1px solid var(--line);
      }
      .footer {
        padding: 0 32px 32px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(31, 109, 26, 0.1);
        color: var(--green);
        font-weight: 700;
        margin-bottom: 16px;
      }
      @media print {
        body { background: #fff; padding: 0; }
        .page { border: 0; box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div>
          <div class="brand">
            <div class="mark">NK</div>
            <div>
              <h1>NavaKrishi</h1>
              <p>Fresh produce from trusted local farmers</p>
            </div>
          </div>
          <p class="muted" style="margin-top: 18px;">Invoice for your completed marketplace order</p>
        </div>
        <div class="meta-grid">
          <div>
            <div class="meta-label">Invoice No.</div>
            <div class="meta-value">${order.invoiceNumber}</div>
          </div>
          <div>
            <div class="meta-label">Order No.</div>
            <div class="meta-value">${order.orderNumber}</div>
          </div>
          <div>
            <div class="meta-label">Payment ID</div>
            <div class="meta-value">${order.paymentId || "Razorpay verified"}</div>
          </div>
          <div>
            <div class="meta-label">Date</div>
            <div class="meta-value">${new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="badge">Paid in full</div>
        <div class="summary">
          <div class="card">
            <div class="section-title">Billing To</div>
            <h2 style="font-size: 22px; margin-bottom: 14px;">${order.customerName || "Valued Customer"}</h2>
            <div class="address">${[shipping.label, shipping.address_line1, shipping.address_line2, [shipping.city, shipping.state].filter(Boolean).join(", "), shipping.pincode, shipping.country, shipping.phone ? `Phone: ${shipping.phone}` : ""].filter(Boolean).join("\n") || "No shipping address saved."}</div>
          </div>
          <div class="card">
            <div class="section-title">Payment Summary</div>
            <div class="totals-row"><span>Subtotal</span><span>${currency.format(order.subtotal)}</span></div>
            <div class="totals-row"><span>GST (5%)</span><span>${currency.format(order.taxAmount)}</span></div>
            <div class="totals-row"><span>Delivery</span><span>Free</span></div>
            <div class="totals-row total"><span>Total</span><span>${currency.format(order.totalAmount)}</span></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="card">
            <div class="section-title">Delivery Address</div>
            <div class="address">${[shipping.address_line1, shipping.address_line2, [shipping.city, shipping.state].filter(Boolean).join(", "), shipping.pincode, shipping.country].filter(Boolean).join("\n") || "No shipping address saved."}</div>
          </div>
          <div class="card">
            <div class="section-title">Notes</div>
            <p class="address">Thank you for choosing NavaKrishi. This invoice confirms successful Razorpay payment and can be used for your records.</p>
          </div>
        </div>
      </div>
      <div class="footer">
        Need support? Email support@navakrishi.local or visit the app support page. This is a generated receipt for the completed checkout order.
      </div>
    </div>
  </body>
</html>`;
};

export const downloadInvoice = (order) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([buildInvoiceHtml(order)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${order.invoiceNumber || "NavaKrishi-Invoice"}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const normalizeOrderForDisplay = (order) => ({
  id: order.id,
  orderNumber: order.order_number,
  invoiceNumber: order.invoice_number,
  paymentId: order.payment_id,
  paymentOrderId: order.payment_order_id,
  paymentSignature: order.payment_signature,
  paymentStatus: order.payment_status,
  customerName: order.customer_name,
  customerEmail: order.customer_email,
  customerPhone: order.customer_phone,
  shippingAddress: order.shipping_address || {},
  subtotal: Number(order.subtotal || 0),
  taxAmount: Number(order.tax_amount || 0),
  deliveryFee: Number(order.delivery_fee || 0),
  totalAmount: Number(order.total_amount || 0),
  createdAt: order.created_at,
  items: (order.items || []).map((item) => ({
    id: item.id,
    title: item.product_title || item.title || "Product",
    image: item.product_image || item.image || "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
    farmerName: item.farmer_name || item.farmerName || "NavaKrishi Farmer",
    quantity: Number(item.quantity || 0),
    unit: item.product_unit || item.unit || "item",
    unitPrice: Number(item.unit_price || item.unitPrice || 0),
    lineTotal: Number(item.total_price || item.lineTotal || 0),
  })),
});