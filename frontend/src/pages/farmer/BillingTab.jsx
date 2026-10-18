import { useEffect, useState } from 'react';
import billingAPI from '../../api/billing';
import MySubscriptions from './MySubscriptions';

export default function BillingTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    billingAPI.getInvoices().then(res => {
      if (isMounted) setOrders(res.data);
    }).catch(() => {
      if (isMounted) setOrders([]);
    }).finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Active Subscriptions</h3>
      <MySubscriptions />

      <h3 className="text-xl font-semibold mt-8 mb-4">Billing History</h3>
      {loading && <div>Loading orders...</div>}
      {!loading && orders.length === 0 && <div>No billing history found.</div>}
      <div className="grid grid-cols-1 gap-3">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{order.order_number}</div>
                <div className="text-sm text-gray-600">{order.customer_name} • {order.customer_email}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">₹{order.total_amount}</div>
                <div className="text-sm text-gray-500">{order.payment_status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
