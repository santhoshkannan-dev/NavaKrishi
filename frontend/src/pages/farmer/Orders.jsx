import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrdersHeader from "../../components/farmer/orders/OrdersHeader";
import OrderTabs from "../../components/farmer/orders/OrderTabs";
import OrdersList from "../../components/farmer/orders/OrdersList";
import DeliveryRoutes from "../../components/farmer/orders/DeliveryRoutes";
import LogisticsStats from "../../components/farmer/orders/LogisticsStats";
import FulfillmentMap from "../../components/farmer/orders/FulfillmentMap";
import OrdersFooter from "../../components/farmer/orders/OrdersFooter";
import OrderDetailsDrawer from "../../components/farmer/orders/OrderDetailsDrawer";
import { ordersAPI } from "../../api/marketplace";
import API from "../../api/axios";
import showToast from "../../utils/toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ all: 0, paid: 0, pending: 0, failed: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [serverRoutes, setServerRoutes] = useState([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {
        page,
        page_size: pageSize,
      };
      if (activeStatus !== "all") {
        filters.payment_status = activeStatus;
      }

      const data = await ordersAPI.getFarmerOrders(filters);

      if (Array.isArray(data)) {
        setOrders(data);
        setTotalCount(data.length);
        setTotalPages(1);
        setStatusCounts({
          all: data.length,
          paid: data.filter((item) => String(item.payment_status || "").toLowerCase() === "paid").length,
          pending: data.filter((item) => String(item.payment_status || "").toLowerCase() === "pending").length,
          failed: data.filter((item) => String(item.payment_status || "").toLowerCase() === "failed").length,
        });
      } else {
        const nextOrders = Array.isArray(data?.results) ? data.results : [];
        setOrders(nextOrders);
        setTotalCount(Number(data?.count || 0));
        setTotalPages(Number(data?.total_pages || 1));
        setStatusCounts({
          all: Number(data?.status_counts?.all || 0),
          paid: Number(data?.status_counts?.paid || 0),
          pending: Number(data?.status_counts?.pending || 0),
          failed: Number(data?.status_counts?.failed || 0),
        });
      }
    } catch (err) {
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);
      setStatusCounts({ all: 0, paid: 0, pending: 0, failed: 0 });
      setError("Unable to load farmer orders right now.");
    } finally {
      setLoading(false);
    }

    try {
      const r = await ordersAPI.getFarmerRoutes();
      setServerRoutes(Array.isArray(r?.routes) ? r.routes : []);
    } catch (e) {
      // ignore
      setServerRoutes([]);
    }
  }, [activeStatus, page, pageSize]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus]);

  // polling for new orders when enabled
  const [autoRefresh, setAutoRefresh] = useState(true);
  useEffect(() => {
    if (!autoRefresh) return undefined;

    const token = localStorage.getItem('token') || '';

    // In development, strict mode mounts effects twice and a short-lived websocket
    // produces noisy proxy errors. Poll instead and keep the live socket for prod.
    if (import.meta.env.DEV || !token) {
      const intervalId = window.setInterval(() => {
        loadOrders();
      }, 15000);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    try {
      const apiBase = new URL(API.defaults.baseURL);
      const protocol = apiBase.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${apiBase.host}/ws/farmer-orders/`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.type === 'order.update') {
            loadOrders();
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onerror = () => {
        // ignore errors silently
      };

      return () => {
        try { ws.close(); } catch (e) { /* noop */ }
      };
    } catch (err) {
      const intervalId = window.setInterval(() => {
        loadOrders();
      }, 15000);

      return () => {
        window.clearInterval(intervalId);
      };
    }
  }, [autoRefresh, loadOrders]);

  // Sync with URL
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const qPage = Number(searchParams.get('page') || page) || 1;
    const qSize = Number(searchParams.get('page_size') || pageSize) || 8;
    const qStatus = searchParams.get('status') || activeStatus || 'all';

    let changed = false;
    if (qPage !== page) { setPage(qPage); changed = true; }
    if (qSize !== pageSize) { setPageSize(qSize); changed = true; }
    if (qStatus !== activeStatus) { setActiveStatus(qStatus); changed = true; }

    // if nothing changed, no-op
    // ensure URL always reflects current state when user interacts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {};
    if (page && page > 1) params.page = String(page);
    if (pageSize && pageSize !== 8) params.page_size = String(pageSize);
    if (activeStatus && activeStatus !== 'all') params.status = activeStatus;

    setSearchParams(params, { replace: true });
  }, [page, pageSize, activeStatus, setSearchParams]);

  const handleMarkShipped = async (order) => {
    try {
      await ordersAPI.markOrderShipped(order.id);
      await loadOrders();
      const updated = orders.find((o) => o.id === order.id) || null;
      setSelectedOrder(updated);
      showToast('Marked shipped for your items.');
    } catch (err) {
      showToast('Unable to mark shipped.');
      // noop for now; could surface a toast
    }
  };

  const handleToggleSelect = (orderId) => {
    setSelectedIds((prev) => {
      if (prev.includes(orderId)) return prev.filter((id) => id !== orderId);
      return [...prev, orderId];
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handleBulkMarkShipped = async () => {
    if (!selectedIds.length) return showToast('No orders selected');
    try {
      await ordersAPI.bulkMarkShipped(selectedIds);
      setSelectedIds([]);
      await loadOrders();
      showToast('Marked selected orders shipped (your items).');
    } catch (err) {
      showToast('Unable to mark selected orders.');
    }
  };

  const handleExportSelected = async () => {
    if (!selectedIds.length) return showToast('No orders selected');
    try {
      const blob = await ordersAPI.exportFarmerOrders({ order_ids: selectedIds });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'farmer_orders_selected.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Unable to export selected orders');
    }
  };

  const counts = useMemo(() => {
    const base = {
      all: 0,
      paid: 0,
      pending: 0,
      failed: 0,
    };

    return {
      ...base,
      all: statusCounts.all || 0,
      paid: statusCounts.paid || 0,
      pending: statusCounts.pending || 0,
      failed: statusCounts.failed || 0,
    };
  }, [statusCounts]);

  const stats = useMemo(() => {
    const totalOrders = totalCount;
    const totalItems = orders.reduce((sum, order) => sum + Number(order.farmer_total_items || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.farmer_total_amount || 0), 0);

    return {
      totalOrders,
      totalItems,
      totalRevenue,
      paidOrders: counts.paid,
    };
  }, [counts.paid, orders, totalCount]);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="space-y-8">
      <OrdersHeader
        totalOrders={stats.totalOrders}
        activeStatus={activeStatus}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left */}
        <div className="xl:col-span-8 space-y-6">
          <OrderTabs
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={counts}
          />

          <OrdersList
            orders={orders}
            loading={loading}
            error={error}
            onViewDetails={setSelectedOrder}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">Show</p>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const next = Math.max(1, Number(e.target.value) || 10);
                    setPageSize(next);
                    setPage(1);
                  }}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                >
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <p className="text-sm text-gray-500">per page</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => canGoPrev && setPage((prev) => prev - 1)}
                  disabled={!canGoPrev}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-[#012d1d] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const windowSize = 5;
                    const half = Math.floor(windowSize / 2);
                    let start = Math.max(1, page - half);
                    let end = Math.min(totalPages, start + windowSize - 1);
                    if (end - start < windowSize - 1) {
                      start = Math.max(1, end - windowSize + 1);
                    }

                    const pages = [];
                    for (let p = start; p <= end; p += 1) pages.push(p);

                    return pages.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold ${p === page ? 'bg-[#1f6d1a] text-white' : 'border border-gray-200 text-[#012d1d] hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => canGoNext && setPage((prev) => prev + 1)}
                  disabled={!canGoNext}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-[#012d1d] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">Auto-refresh</label>
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />

                <label className="text-sm text-gray-600">Select</label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm"
                >
                  {selectedIds.length === orders.length ? 'Clear' : 'All'}
                </button>

                <button
                  type="button"
                  onClick={handleBulkMarkShipped}
                  className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm"
                >
                  Mark Selected Shipped
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleExportSelected}
                  className="px-4 py-2 rounded-xl bg-[#012d1d] text-white font-semibold"
                >
                  Export CSV
                </button>
              </div>
            </div>
          <DeliveryRoutes orders={orders} routesFromServer={serverRoutes} />

          <LogisticsStats stats={stats} />

          <FulfillmentMap />
        </div>
      </div>

      <OrdersFooter />

      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onMarkShipped={handleMarkShipped}
      />
    </div>
  );
};

export default Orders;