import { useEffect, useState } from "react";
import AnalyticsHeader from "../../components/farmer/analytics/AnalyticsHeader";
import AnalyticsStats from "../../components/farmer/analytics/AnalyticsStats";
import RevenueTrend from "../../components/farmer/analytics/RevenueTrend";
import CategoryPerformance from "../../components/farmer/analytics/CategoryPerformance";
import YieldEfficiency from "../../components/farmer/analytics/YieldEfficiency";
import CustomerInsights from "../../components/farmer/analytics/CustomerInsights";
import RecentTransactions from "../../components/farmer/analytics/RecentTransactions";
import AnalyticsFooter from "../../components/farmer/analytics/AnalyticsFooter";
import { ordersAPI } from "../../api/marketplace";

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [ordersData, setOrdersData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getFarmerAnalytics();
      setOrdersData(data);
    } catch (err) {
      console.error('Failed to load farmer analytics', err);
    } finally {
      setLoading(false);
    }
  };

  // compute props for children
  const aggregates = ordersData?.aggregates || {};
  const trend = ordersData?.monthly || [];
  const categories = ordersData?.categories || [];
  const recent = (ordersData?.recent || []).map((r) => ({
    product: r.product,
    customer: r.customer,
    date: new Date(r.date).toLocaleDateString(),
    amount: `₹${Number(r.amount || 0).toFixed(2)}`,
    status: (r.status || '').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Paid',
  }));

  return (
    <div className="space-y-8">

      <AnalyticsHeader onRefresh={loadAnalytics} />

      <AnalyticsStats
        data={{
          total_revenue: Number(aggregates.total_revenue || 0),
          total_items: Number(aggregates.total_items || 0),
          active_orders: Number(ordersData?.aggregates?.total_orders || 0),
          total_orders: ordersData?.count || 0,
        }}
        loading={loading}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        <div className="xl:col-span-8">
          <RevenueTrend trend={trend} />
        </div>

        <div className="xl:col-span-4">
          <CategoryPerformance categories={categories} />
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        <div className="xl:col-span-7">
          <YieldEfficiency yield={ordersData?.yield_efficiency} />
        </div>

        <div className="xl:col-span-5">
          <CustomerInsights insights={ordersData?.customer_insights} />
        </div>
      </div>

      <RecentTransactions transactions={recent} />

      <AnalyticsFooter />
    </div>
  );
};

export default Analytics;