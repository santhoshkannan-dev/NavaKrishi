import { useEffect, useMemo, useState } from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiPackage,
  FiPlus,
  FiTrendingUp,
} from "react-icons/fi";

import API from "../../api/axios";
import { productsAPI } from "../../api/marketplace";
import { useAuth } from "../../context/AuthContext";
import KPICards from "../../components/farmer/KPICards";
import RevenueChart from "../../components/farmer/RevenueChart";
import PopularProducts from "../../components/farmer/PopularProducts";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getMonthKey = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("en-US", { month: "short" });
};

const buildRevenuePoints = (products) => {
  const monthlyValues = new Map();

  products.forEach((product) => {
    const monthKey = getMonthKey(product.created_at);
    if (!monthKey) return;

    const inventoryValue = Number(product.price || 0) * Number(product.quantity_available || 0);
    monthlyValues.set(monthKey, (monthlyValues.get(monthKey) || 0) + inventoryValue);
  });

  const sortedMonths = Array.from(monthlyValues.keys()).sort();
  const recentMonths = sortedMonths.slice(-6);
  const peakValue = Math.max(...recentMonths.map((monthKey) => monthlyValues.get(monthKey) || 0), 1);

  return recentMonths.map((monthKey) => {
    const value = monthlyValues.get(monthKey) || 0;

    return {
      month: getMonthLabel(monthKey),
      value: Math.max(10, Math.round((value / peakValue) * 100)),
      amount: value,
    };
  });
};

const quickActions = [
  {
    label: "Add product",
    icon: <FiPlus />,
    primary: true,
  },
  {
    label: "Open inventory",
    icon: <FiPackage />,
  },
  {
    label: "Review analytics",
    icon: <FiTrendingUp />,
  },
];

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [productList, alertsResponse] = await Promise.allSettled([
          productsAPI.getMyProducts(),
          API.get("/notifications/unread_count/"),
        ]);

        if (!isMounted) return;

        if (productList.status === "fulfilled") {
          setProducts(Array.isArray(productList.value) ? productList.value : []);
        } else {
          throw productList.reason;
        }

        if (alertsResponse.status === "fulfilled") {
          setUnreadAlerts(Number(alertsResponse.value?.data?.count) || 0);
        } else {
          setUnreadAlerts(0);
        }
      } catch (loadError) {
        if (!isMounted) return;

        setError("We could not load your live dashboard data right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const derivedStats = useMemo(() => {
    const activeListings = products.filter((product) => product.is_active).length;
    const lowStock = products.filter((product) => Number(product.quantity_available || 0) <= 20).length;
    const inventoryValue = products.reduce(
      (total, product) => total + Number(product.price || 0) * Number(product.quantity_available || 0),
      0
    );
    const averageRating = products.length
      ? products.reduce((total, product) => total + Number(product.rating || 0), 0) / products.length
      : 0;

    return {
      activeListings,
      lowStock,
      inventoryValue,
      averageRating,
    };
  }, [products]);

  const revenuePoints = useMemo(() => buildRevenuePoints(products), [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((left, right) => {
        const leftValue = Number(left.price || 0) * Number(left.quantity_available || 0);
        const rightValue = Number(right.price || 0) * Number(right.quantity_available || 0);
        return rightValue - leftValue;
      })
      .slice(0, 3)
      .map((product) => ({
        name: product.title,
        value: Number(product.price || 0) * Number(product.quantity_available || 0),
      }));
  }, [products]);

  const recentListings = useMemo(() => {
    return [...products]
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
      .slice(0, 4);
  }, [products]);

  const kpiStats = [
    {
      title: "Active listings",
      value: loading ? "..." : String(derivedStats.activeListings),
      meta: `${Math.max(0, products.length - derivedStats.activeListings)} inactive`,
    },
    {
      title: "Inventory value",
      value: loading ? "..." : formatCurrency(derivedStats.inventoryValue),
      meta: unreadAlerts ? `${unreadAlerts} unread alerts` : "All alerts reviewed",
    },
    {
      title: "Low stock items",
      value: loading ? "..." : String(derivedStats.lowStock),
      meta: derivedStats.lowStock > 0 ? "Restock soon" : "Stock healthy",
    },
    {
      title: "Average rating",
      value: loading ? "..." : derivedStats.averageRating ? `${derivedStats.averageRating.toFixed(1)}/5` : "0.0/5",
      meta: "Across live products",
    },
  ];

  const greeting = useMemo(() => {
    try {
      // Use locale 12-hour format so systems with AM/PM don't misreport
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const parts = timeStr.split(' ');
      const period = parts.length > 1 ? String(parts.pop()).toUpperCase() : null; // 'AM' or 'PM'
      const hour12 = Number((parts[0] || '').split(':')[0]) || new Date().getHours();

      if (period === 'AM') return 'Good morning';
      if (period === 'PM') {
        // Treat evening after 6pm as evening
        if (hour12 >= 6) return 'Good evening';
        return 'Good afternoon';
      }

      // Fallback to hour-based if period not detectable
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Good morning';
      if (hour >= 12 && hour < 17) return 'Good afternoon';
      if (hour >= 17 && hour < 21) return 'Good evening';
      return 'Good night';
    } catch (e) {
      return 'Hello';
    }
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-4xl border border-[#dfe8d8] bg-linear-to-br from-[#f6fbf2] via-[#eef7e7] to-[#e6f2dd] p-8 md:p-10 shadow-sm">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#a4f792]/30 blur-3xl" />
        <div className="absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-[#1f6d1a]/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#2f6b23] backdrop-blur">
              <FiCalendar />
              {loading ? "Loading live farm data" : "Updated from your listings"}
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-[#012d1d] md:text-6xl">
              {greeting}, {user?.first_name || user?.username || "Farmer"}.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#476356] md:text-lg">
              Your dashboard is now reading live product data, stock levels, and alerts from the backend so you can track the farm from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    action.primary
                      ? "bg-[#1f6d1a] text-white shadow-lg shadow-[#1f6d1a]/20 hover:bg-[#175515]"
                      : "bg-white/80 text-[#012d1d] ring-1 ring-[#d6e4cf] hover:bg-white"
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-[#0f3b24]/5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#476356]">
                    Today&apos;s focus
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#012d1d]">
                    {derivedStats.activeListings} live listings
                  </h2>
                </div>

                <span className={`rounded-2xl px-3 py-2 text-sm font-semibold ${unreadAlerts > 0 ? "bg-[#fff4db] text-[#8a5b00]" : "bg-[#eef8e8] text-[#2f6b23]"}`}>
                  {unreadAlerts > 0 ? `${unreadAlerts} alerts` : "All clear"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#eef8e8] text-[#2f6b23] px-4 py-3">
                  <p className="text-sm font-semibold">Inventory value</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{formatCurrency(derivedStats.inventoryValue)} across active stock.</p>
                </div>

                <div className="rounded-2xl bg-[#fff4db] text-[#8a5b00] px-4 py-3">
                  <p className="text-sm font-semibold">Low stock watch</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{derivedStats.lowStock} products need a restock review.</p>
                </div>

                {error && (
                  <div className="rounded-2xl bg-[#fee2e2] px-4 py-3 text-[#b42318]">
                    <p className="text-sm font-semibold">Live data unavailable</p>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                  </div>
                )}
              </div>

              <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1f6d1a]">
                Open planning board
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      <KPICards stats={kpiStats} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RevenueChart
            points={revenuePoints.length > 0 ? revenuePoints : undefined}
            eyebrow="Product value trend"
            heading="How your live stock value moves"
            summaryLabel="Inventory value"
            summaryValue={formatCurrency(derivedStats.inventoryValue)}
            metricCards={[
              {
                label: "Active listings",
                value: String(derivedStats.activeListings),
                className: "bg-[#f5f5f3]",
              },
              {
                label: "Low stock items",
                value: String(derivedStats.lowStock),
                className: "bg-[#eef8e8]",
                labelClassName: "text-[#2f6b23]",
              },
              {
                label: "Unread alerts",
                value: String(unreadAlerts),
                className: "bg-[#fff7ed]",
                labelClassName: "text-[#a15c09]",
                valueClassName: "text-[#012d1d]",
              },
            ]}
          />
        </div>

        <div className="xl:col-span-4">
          <PopularProducts
            products={topProducts.length > 0 ? topProducts.map((product) => ({
              name: product.name,
              value: product.value,
            })) : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f6b23]">
                Latest listings
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#012d1d]">
                Recently added products
              </h2>
            </div>

            <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f6d1a]">
              View all inventory
              <FiArrowRight />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f3] text-left text-gray-500">
                <tr>
                  <th className="p-5">Product</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Price</th>
                  <th className="p-5">Stock</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentListings.length > 0 ? (
                  recentListings.map((product) => (
                    <tr key={product.id} className="border-t border-gray-100">
                      <td className="p-5">
                        <div className="font-semibold text-[#012d1d]">{product.title}</div>
                        <div className="mt-1 text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5 text-gray-600">{product.category?.name || "Uncategorized"}</td>
                      <td className="p-5 font-semibold text-[#1f6d1a]">{formatCurrency(product.price)}</td>
                      <td className="p-5 text-gray-600">{product.quantity_available} units</td>
                      <td className="p-5">
                        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${product.is_active ? "bg-[#dff5d8] text-[#267320]" : "bg-[#f5f5f3] text-gray-500"}`}>
                          {product.is_active ? "Active" : "Paused"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-gray-500" colSpan={5}>
                      {loading ? "Loading your live listings..." : "No products found for this farmer account."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="h-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-[#012d1d]">
              <FiAlertTriangle className="text-xl" />
              <h2 className="text-2xl font-bold">Activity snapshot</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#f5f5f3] p-4">
                <p className="text-sm text-gray-500">Products tracked</p>
                <p className="mt-1 text-3xl font-bold text-[#012d1d]">{products.length}</p>
              </div>

              <div className="rounded-2xl bg-[#eef8e8] p-4">
                <p className="text-sm text-[#2f6b23]">Unread alerts</p>
                <p className="mt-1 text-3xl font-bold text-[#012d1d]">{unreadAlerts}</p>
              </div>

              <div className="rounded-2xl bg-[#fff7ed] p-4">
                <p className="text-sm text-[#a15c09]">Low stock products</p>
                <p className="mt-1 text-3xl font-bold text-[#012d1d]">{derivedStats.lowStock}</p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              Keep the dashboard open while updating inventory so you can spot low stock, inactive listings, and incoming alerts before they become a bottleneck.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;