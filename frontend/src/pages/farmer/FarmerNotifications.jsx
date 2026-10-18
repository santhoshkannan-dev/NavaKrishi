import { useEffect, useMemo, useState } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiRefreshCw, FiInbox } from "react-icons/fi";

import API from "../../api/axios";
import showToast from "../../utils/toast";

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const loadNotifications = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await API.get("/notifications/");
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadNotifications();
    };

    run();

    const timer = window.setInterval(() => {
      if (mounted) {
        loadNotifications({ silent: true });
      }
    }, 20000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const markRead = async (id) => {
    setProcessingId(id);
    try {
      const response = await API.post(`/notifications/${id}/mark_read/`);
      const updated = response.data;
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast("Notification marked as read.");
    } catch (error) {
      showToast("Unable to mark notification as read.");
    } finally {
      setProcessingId(null);
    }
  };

  const markAllRead = async () => {
    setProcessingId("all");
    try {
      await API.post("/notifications/mark_all_read/");
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      showToast("All notifications marked as read.");
    } catch (error) {
      showToast("Unable to mark all notifications as read.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-4xl border border-[#dfe8d8] bg-linear-to-br from-[#f6fbf2] via-[#eef7e7] to-[#e6f2dd] p-6 md:p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#a4f792]/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[#2f6b23] backdrop-blur">
              <FiBell />
              Farmer notifications
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#012d1d] md:text-5xl">
              Notification center
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#476356]">
              Track orders, subscription reminders, and farm updates in one place. New items refresh automatically while this page is open.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadNotifications({ silent: true })}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#012d1d] ring-1 ring-[#d6e4cf] transition hover:bg-[#f7fbf5]"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={markAllRead}
              disabled={processingId === "all" || unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1f6d1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#175515] disabled:cursor-not-allowed disabled:bg-[#9fc29a]"
            >
              <FiCheckCircle />
              {processingId === "all" ? "Updating..." : "Mark all read"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#012d1d]">Inbox</h2>
            <p className="text-sm text-gray-500">
              {loading ? "Loading notifications..." : `${notifications.length} total • ${unreadCount} unread`}
            </p>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "—"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-gray-500">
            <FiInbox className="text-5xl text-gray-300" />
            <p className="text-lg font-semibold text-[#012d1d]">No notifications yet</p>
            <p className="max-w-md text-sm">
              Notifications about orders, renewals, and platform updates will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`rounded-3xl border p-4 transition ${item.is_read ? "border-gray-200 bg-white" : "border-[#cfe7c6] bg-[#f6fbf5]"}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#012d1d]">{item.title}</h3>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {item.notification_type}
                      </span>
                      {!item.is_read && (
                        <span className="rounded-full bg-[#dff3d9] px-2.5 py-1 text-[11px] font-semibold text-[#1f6d1a]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.message}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>{formatTime(item.created_at)}</span>
                      {item.related_order_number && <span>Order {item.related_order_number}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        disabled={processingId === item.id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#1f6d1a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#175515] disabled:cursor-not-allowed disabled:bg-[#9fc29a]"
                      >
                        <FiCheck />
                        {processingId === item.id ? "Updating..." : "Mark read"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FarmerNotifications;
