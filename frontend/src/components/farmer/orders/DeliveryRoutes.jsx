import { FiCpu } from "react-icons/fi";
import { useMemo, useState } from "react";

// DeliveryRoutes: shows simple route suggestions for the farmer based on orders
// Props:
// - orders: array of farmer-scoped orders (each order contains `shipping_address` and `farmer_total_items`)
const DeliveryRoutes = ({ orders = [], routesFromServer = [] }) => {
  const routes = useMemo(() => {
    if (Array.isArray(routesFromServer) && routesFromServer.length) {
      return routesFromServer.map((r) => ({ key: r.key, label: r.label, stops: r.stops, totalItems: r.total_items || r.totalItems || 0, order_ids: r.order_ids }));
    }

    // fallback: group orders by pincode (fallback to city or 'Unknown')
    const map = {};
    (orders || []).forEach((o) => {
      const addr = o.shipping_address || {};
      const key = String(addr.pincode || addr.city || 'unknown');
      if (!map[key]) map[key] = { key, label: addr.pincode ? `Pincode ${addr.pincode}` : (addr.city || 'Unknown'), orders: [] };
      map[key].orders.push(o);
    });

    // create route list, sorted by number of stops desc
    return Object.values(map)
      .map((r) => ({ ...r, stops: r.orders.length, totalItems: r.orders.reduce((s, ord) => s + Number(ord.farmer_total_items || 0), 0), orders: r.orders }))
      .sort((a, b) => b.stops - a.stops);
  }, [orders, routesFromServer]);

  const [activeRoute, setActiveRoute] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openMap = (route) => {
    // prefer server-provided formatted addresses
    let addresses = Array.isArray(route.addresses) && route.addresses.length ? route.addresses.slice() : null;

    if (!addresses) {
      // route may come from server with order_ids only or client with orders
      const routeOrders = route.orders || (Array.isArray(route.order_ids) ? orders.filter((o) => route.order_ids.includes(o.id)) : []);

      addresses = (routeOrders || []).map((o) => {
        const a = o.shipping_address || {};
        const parts = [a.address_line1 || a.address || '', a.city || '', a.state || '', a.pincode || ''].filter(Boolean);
        return parts.join(', ');
      });
    }

    // sanitize: remove empty, trim, dedupe, limit to 10
    addresses = (addresses || []).map((s) => (s || '').trim()).filter(Boolean);
    addresses = [...new Set(addresses)];
    if (addresses.length > 10) addresses = addresses.slice(0, 10);

    setActiveRoute({ ...route, addresses });
    setShowModal(true);
  };

  const openInMaps = (addresses) => {
    if (!addresses || !addresses.length) return window.alert('No addresses available');
    const joined = addresses.map(encodeURIComponent).join('/');
    const url = `https://www.google.com/maps/dir/${joined}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="bg-[#012d1d] text-white rounded-3xl p-8 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <FiCpu className="text-[#a4f792] text-2xl" />

          <h2 className="text-4xl font-bold">Optimal Delivery Routes</h2>
        </div>

        <p className="text-gray-300 mt-6 leading-relaxed">
          AI analysis complete. Reduce your carbon footprint by choosing grouped deliveries.
        </p>

        {routes.length === 0 ? (
          <div className="bg-[#1b4332] rounded-2xl p-5 mt-8 border border-white/10">
            <h3 className="font-semibold text-[#a4f792]">No suggested routes yet</h3>
            <p className="text-sm text-gray-400 mt-2">You currently have no farmer-scoped orders to suggest routes for.</p>
          </div>
        ) : (
          routes.slice(0, 3).map((r) => (
            <div key={r.key} className="bg-[#1b4332] rounded-2xl p-5 mt-6 border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-[#a4f792]">{r.label}</h3>
                  <p className="text-sm text-gray-300">{r.stops} stop{r.stops > 1 ? 's' : ''} • {r.totalItems} item{r.totalItems > 1 ? 's' : ''}</p>
                </div>

                <button
                  type="button"
                  onClick={() => openMap(r)}
                  className="ml-4 bg-[#a4f792] text-[#012d1d] py-2 px-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Open Map
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-2">Combining these stops reduces travel and emissions.</p>
            </div>
          ))
        )}

        {showModal && activeRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
            <div className="relative z-60 w-full max-w-2xl bg-white text-black rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Route: {activeRoute.label}</h3>
                  <p className="text-sm text-gray-600">{activeRoute.stops} stop{activeRoute.stops > 1 ? 's' : ''}</p>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-600">Close</button>
              </div>

              <div className="mt-4 max-h-64 overflow-auto">
                {activeRoute.addresses && activeRoute.addresses.length ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {activeRoute.addresses.map((a, i) => (
                      <li key={i} className="text-sm text-gray-800">{a}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-600">No address details available for this route.</p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => openInMaps(activeRoute.addresses)}
                  className="px-4 py-2 bg-[#1b4332] text-white rounded-xl"
                >
                  Open in Google Maps
                </button>

                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText((activeRoute.addresses || []).join('\n'))}
                  className="px-4 py-2 border rounded-xl"
                >
                  Copy Addresses
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm italic text-gray-400">Tip: Group deliveries in nearby pincodes to save time and fuel.</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRoutes;