import { useEffect, useState } from 'react';
import billingAPI from '../../api/billing';
import showToast from '../../utils/toast';
import showConfirm from '../../utils/confirm';

export default function MySubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    billingAPI.mySubscriptions()
      .then(res => {
        // filter out simulated/fake subscriptions created during dev (id starts with sub_fake_)
        const filtered = (res.data || []).filter(s => !(s.razorpay_subscription_id || '').startsWith('sub_fake_'));
        // dedupe by plan id (prefer latest)
        const map = new Map();
        filtered.forEach(s => {
          const key = s.plan?.id || s.razorpay_subscription_id || s.id;
          map.set(key, s);
        });
        setSubs(Array.from(map.values()).reverse());
      })
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id, cancelAtEnd = false) => {
    const prompt = cancelAtEnd ? 'Cancel at period end?' : 'Cancel this subscription now?';
    const ok = await showConfirm(prompt);
    if (!ok) return;
    setProcessingId(id);
    try {
      const res = await billingAPI.cancelSubscription(id, cancelAtEnd);
      const updated = res.data.subscription;
      setSubs((s) => s.map((sub) => (sub.id === updated.id ? updated : sub)));
      showToast('Subscription cancellation requested.');
    } catch (err) {
      console.error(err);
      showToast('Unable to cancel subscription.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleAutoRenew = async (id, value) => {
    setProcessingId(id);
    try {
      const res = await billingAPI.setAutoRenew(id, value);
      const updated = res.data.subscription;
      setSubs((s) => s.map((sub) => (sub.id === updated.id ? updated : sub)));
      showToast(value ? 'Auto-renew enabled.' : 'Auto-renew disabled.');
    } catch (err) {
      console.error(err);
      showToast('Unable to update auto-renew.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenewNow = async (id) => {
    const ok = await showConfirm('Renew this subscription now?');
    if (!ok) return;
    setProcessingId(id);
    try {
      const res = await billingAPI.renewSubscription(id);
      const updated = res.data.subscription;
      // replace old subscription in list with new one (or append)
      setSubs((s) => [updated, ...s.filter(x => x.id !== updated.id)]);
      showToast('Subscription renewed.');
    } catch (err) {
      console.error(err);
      showToast('Unable to renew subscription.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading subscriptions...</div>;

  // Prefer showing only the 'Pro' subscription if user has it, otherwise show active subscriptions
  const activeSubs = subs.filter(s => (s.status || '').toLowerCase() === 'active');
  const proSubs = activeSubs.filter(s => (s.plan?.name || '').toLowerCase() === 'pro');
  const displaySubs = proSubs.length > 0 ? proSubs : (activeSubs.length > 0 ? activeSubs : subs);

  const fmt = (val) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return d.toLocaleString();
    } catch (e) {
      return val;
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Subscriptions</h2>
      {displaySubs.length === 0 && <div>No active subscriptions found.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySubs.map((sub) => (
          <div key={sub.id} className="border rounded-lg p-6 shadow-sm bg-white flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{sub.plan?.name || '—'}</div>
                <div className="text-sm text-gray-600">{sub.plan?.description || ''}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{(sub.plan?.currency || 'INR')} {(sub.plan?.amount || 0)}</div>
                {sub.plan?.recommended && <div className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</div>}
              </div>
            </div>

            {sub.plan?.features && sub.plan.features.length > 0 && (
              <ul className="mt-4 text-sm text-gray-700 list-disc list-inside">
                {sub.plan.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Status: <span className="font-medium">{sub.status}</span></div>
              <div className="text-sm text-gray-500">Start: {fmt(sub.start_date || sub.current_start)} • End: {fmt(sub.end_date || sub.current_end)}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!sub.auto_renew} onChange={(e) => handleToggleAutoRenew(sub.id, e.target.checked)} />
                <span className="text-sm">Auto-renew</span>
              </label>
              {sub.status !== 'cancelled' && (
                <>
                  <button
                    disabled={processingId === sub.id}
                    onClick={() => handleCancel(sub.id, false)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                  >
                    {processingId === sub.id ? 'Cancelling...' : 'Cancel Now'}
                  </button>

                  <button
                    disabled={processingId === sub.id}
                    onClick={() => handleCancel(sub.id, true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                  >
                    {processingId === sub.id ? 'Processing...' : 'Cancel at Period End'}
                  </button>
                  <button
                    disabled={processingId === sub.id}
                    onClick={() => handleRenewNow(sub.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    {processingId === sub.id ? 'Processing...' : 'Renew Now'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
