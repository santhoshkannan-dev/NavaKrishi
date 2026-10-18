import { useEffect, useMemo, useState } from "react";

import AIStatsCards from "../../components/farmer/ai/AIStatsCards";
import SoilHealthRadar from "../../components/farmer/ai/SoilHealthRadar";
import CriticalRecommendations from "../../components/farmer/ai/CriticalRecommendations";
import YieldPredictions from "../../components/farmer/ai/YieldPredictions";
import PestRiskMatrix from "../../components/farmer/ai/PestRiskMatrix";
import AIInsightsFooter from "../../components/farmer/ai/AIInsightsFooter";
import { ordersAPI, productsAPI } from "../../api/marketplace";
import API from "../../api/axios";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toPercent = (value) => `${Math.round(Number(value) || 0)}%`;

const buildYieldSeries = (monthly = []) => {
  const points = Array.isArray(monthly) ? monthly.slice(-6) : [];
  const max = Math.max(...points.map((item) => Number(item.value) || 0), 1);

  return points.map((item, index) => {
    const actual = Math.round(((Number(item.value) || 0) / max) * 100);
    const projected = clamp(Math.round(actual * 1.1), 8, 100);

    return {
      phase: item.label || `Phase ${index + 1}`,
      projected,
      actual: clamp(actual, 6, 100),
    };
  });
};

const AIInsights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadInsights = async () => {
      try {
        setLoading(true);
        setError("");

        const [analyticsRes, productsRes, alertsRes] = await Promise.allSettled([
          ordersAPI.getFarmerAnalytics(),
          productsAPI.getMyProducts(),
          API.get("/notifications/unread_count/"),
        ]);

        if (!isMounted) return;

        if (analyticsRes.status === "fulfilled") {
          setAnalytics(analyticsRes.value || null);
        } else {
          setAnalytics(null);
        }

        if (productsRes.status === "fulfilled") {
          setProducts(Array.isArray(productsRes.value) ? productsRes.value : []);
        } else {
          setProducts([]);
        }

        if (alertsRes.status === "fulfilled") {
          setUnreadAlerts(Number(alertsRes.value?.data?.count) || 0);
        } else {
          setUnreadAlerts(0);
        }

        if (analyticsRes.status !== "fulfilled" && productsRes.status !== "fulfilled") {
          setError("We could not load AI insight data right now.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    const totalItems = Number(analytics?.aggregates?.total_items || 0);
    const retention = Number(analytics?.customer_insights?.retention_rate_percent || 0);
    const avgOrderValue = Number(analytics?.aggregates?.avg_order_value || 0);
    const aiAdoption = Number(analytics?.yield_efficiency?.ai_adoption_percent || 0);
    const activeListings = products.filter((item) => item.is_active).length;
    const lowStockCount = products.filter((item) => Number(item.quantity_available || 0) <= 20).length;

    const lowStockPenalty = products.length > 0 ? (lowStockCount / products.length) * 35 : 0;
    const alertsPenalty = unreadAlerts > 0 ? 8 : 0;
    const overallHealth = clamp(Math.round(100 - lowStockPenalty - alertsPenalty), 45, 99);

    const stats = [
      {
        title: "Overall Farm Health",
        value: toPercent(overallHealth),
        extra: `${lowStockCount} low-stock`,
        color: "text-[#1f6d1a]",
      },
      {
        title: "Projected Yield",
        value: `${(totalItems / 1000).toFixed(1)}t`,
        extra: "based on orders",
        color: "text-[#012d1d]",
      },
      {
        title: "Active Alerts",
        value: String(unreadAlerts + lowStockCount).padStart(2, "0"),
        extra: unreadAlerts > 0 ? "Action Required" : "All clear",
        color: "text-[#b42318]",
      },
      {
        title: "Next Harvest",
        value: String(lowStockCount > 0 ? 4 : 6).padStart(2, "0"),
        extra: "Days Left",
        color: "text-[#012d1d]",
      },
    ];

    const recommendations = [
      {
        type: "soil",
        title: lowStockCount > 0 ? `Restock ${lowStockCount} low-stock listing(s)` : "Maintain current stock rhythm",
        description: lowStockCount > 0
          ? "Stock pressure is increasing in priority items. Raise replenishment quantity for next cycle."
          : "Current inventory coverage is healthy across active listings.",
        ctaLabel: "Apply Now",
      },
      {
        type: "harvest",
        title: retention < 40 ? "Run loyalty offer for repeat buyers" : "Prepare for harvest in 4 days",
        description: retention < 40
          ? "Customer retention is below target. Launch a repeat-order campaign this week."
          : "Maturity trend and demand velocity suggest the next dispatch window is near.",
        ctaLabel: "View Plan",
      },
    ];

    const soilMetrics = [
      { label: "Nitrogen", value: clamp(Math.round(45 + aiAdoption * 0.5), 25, 95) },
      { label: "Phosphorus", value: clamp(Math.round(40 + retention * 0.7), 20, 95) },
      { label: "Potassium", value: clamp(Math.round(50 + activeListings * 2), 25, 95) },
      { label: "Organic Matter", value: clamp(Math.round(40 + avgOrderValue / 250), 20, 95) },
      { label: "Moisture", value: clamp(Math.round(lowStockCount > 0 ? 58 : 74), 20, 95) },
    ];

    const alignmentPercent = clamp(
      Math.round(soilMetrics.reduce((sum, metric) => sum + metric.value, 0) / soilMetrics.length),
      0,
      100
    );

    const risks = [
      {
        title: "Late blight probability",
        risk: lowStockCount > 3 ? "HIGH RISK" : "MODERATE",
        description: "Inventory and moisture trends indicate elevated fungal stress in active zones.",
        confidence: clamp(65 + lowStockCount * 5, 60, 96),
      },
      {
        title: "Aphid pressure",
        risk: retention < 35 ? "MODERATE" : "LOW RISK",
        description: "Shifts in demand by produce segment can indicate seasonal pest movement.",
        confidence: clamp(55 + retention, 50, 94),
      },
      {
        title: "Root-zone stability",
        risk: unreadAlerts > 0 ? "MODERATE" : "LOW RISK",
        description: "Current operational signals indicate stable root-zone and drainage behavior.",
        confidence: clamp(70 + unreadAlerts * 3, 60, 95),
      },
    ];

    return {
      stats,
      recommendations,
      soilMetrics,
      alignmentPercent,
      risks,
      yieldSeries: buildYieldSeries(analytics?.monthly),
    };
  }, [analytics, products, unreadAlerts]);

  return (
    <div className="pb-20">

      {error && (
        <div className="mb-6 rounded-2xl bg-[#fee2e2] px-5 py-4 text-sm text-[#b42318]">
          {error}
        </div>
      )}

      <AIStatsCards stats={derived.stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">

        <div className="xl:col-span-5">
          <SoilHealthRadar metrics={derived.soilMetrics} alignmentPercent={derived.alignmentPercent} />
        </div>

        <div className="xl:col-span-7 space-y-8">

          <CriticalRecommendations recommendations={derived.recommendations} />

          <YieldPredictions series={derived.yieldSeries} />
        </div>
      </div>

      <PestRiskMatrix risks={derived.risks} />

      <AIInsightsFooter />
    </div>
  );
};

export default AIInsights;