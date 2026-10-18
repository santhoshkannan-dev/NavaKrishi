import { useEffect, useState } from 'react';
import billingAPI from '../../api/billing';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../utils/toast';

const currencySymbols = {
  INR: '₹',
  USD: '$',
};

const FarmerSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    Promise.allSettled([
      billingAPI.getPlans(),
      billingAPI.mySubscriptions(),
    ])
      .then(([plansResult, subsResult]) => {
        setPlans(plansResult.status === 'fulfilled' ? (plansResult.value.data || []) : []);
        setMySubscriptions(subsResult.status === 'fulfilled' ? (subsResult.value.data || []) : []);
      })
      .catch(() => {
        setPlans([]);
        setMySubscriptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentActiveSubscription = mySubscriptions.find((sub) => (sub.status || '').toLowerCase() === 'active') || mySubscriptions[0] || null;
  const currentVisibleSubscription = mySubscriptions.find((sub) => (sub.status || '').toLowerCase() === 'active')
    || mySubscriptions.find((sub) => (sub.status || '').toLowerCase() === 'created')
    || mySubscriptions.find((sub) => (sub.status || '').toLowerCase() !== 'cancelled')
    || mySubscriptions[0]
    || null;
  const currentPlanId = currentVisibleSubscription?.plan?.id || null;
  const currentPlanName = currentVisibleSubscription?.plan?.name || 'No active plan';
  const currentPlanLimit = currentVisibleSubscription?.plan?.product_limit || null;
  const currentPlanLimitLabel = currentVisibleSubscription?.plan?.product_limit_label || '—';
  const currentPlanStatus = (currentVisibleSubscription?.status || 'none').toUpperCase();

  const handleSubscribe = async (planId) => {
    if (!user) return;
    setSubscribing(true);
    try {
      const res = await billingAPI.createSubscription(planId);
      const { subscription, razorpay, key_id } = res.data;
      // update local subscriptions state so the UI reflects the newly created subscription
      setMySubscriptions((current) => {
        if (!subscription) return current;
        const without = Array.isArray(current) ? current.filter((s) => s.id !== subscription.id) : [];
        return [subscription, ...without];
      });
      // notify other pages (e.g. Inventory) that subscriptions changed
      try {
        window.dispatchEvent(new CustomEvent('subscription:changed', { detail: subscription }));
      } catch (err) {
        // ignore if dispatch fails in some environments
      }
      // Load Razorpay script if needed
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      // Razorpay response may be a plain object (or in some libs a Map-like); handle both safely
      const razorpayId = (razorpay && (typeof razorpay.get === 'function' ? razorpay.get('id') : (razorpay.id || razorpay['id']))) || subscription?.razorpay_subscription_id;

      const options = {
        key: key_id,
        subscription_id: razorpayId,
        name: 'NavaKrishi Subscriptions',
        description: subscription?.plan?.name || 'Farmer subscription',
        handler: function (response) {
          // For subscription flows Razorpay will notify via webhooks; show success toast
          showToast('Subscription created — server will confirm status via webhook.');
        },
        theme: { color: '#1f6d1a' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail || err?.response?.data?.error || 'Unable to create subscription.';
      showToast(detail);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>

      <div className="mb-6 rounded-2xl border border-[#dfe8d8] bg-[#f6fbf2] p-5">
        <p className="text-sm font-semibold text-[#2f6b23]">Current plan</p>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-bold text-[#012d1d]">{currentPlanName}</p>
          {currentVisibleSubscription ? (
            <div className="text-sm text-gray-600">
              <p>Valid till {currentVisibleSubscription.end_date ? new Date(currentVisibleSubscription.end_date).toLocaleDateString() : '—'}</p>
              {currentPlanLimit && <p>Product limit: {currentPlanLimitLabel}</p>}
              <p>Status: {currentPlanStatus}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No active subscription yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-gray-600">No subscription plans available right now.</div>
        )}

        {plans.map((plan) => {
          const amount = Number(plan.amount || 0);
          const symbol = currencySymbols[plan.currency] || plan.currency || '';
          const formatted = new Intl.NumberFormat(plan.currency === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
          const isCurrentPlan = currentPlanId === plan.id;
          const subscriptionDetail = mySubscriptions.find((sub) => sub.plan?.id === plan.id);

          return (
            <div key={plan.id} className={`border rounded-lg p-6 shadow-sm flex flex-col justify-between ${plan.recommended ? 'ring-2 ring-[#b7f0b8]' : ''}`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="flex items-center gap-3">
                    {plan.recommended && <span className="text-sm bg-[#1f6d1a] text-white px-2 py-1 rounded">Recommended</span>}
                    {isCurrentPlan && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Current plan</span>}
                    {subscriptionDetail && (subscriptionDetail.status || '').toLowerCase() !== 'active' && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{subscriptionDetail.status}</span>}
                    {!plan.active && <span className="text-sm text-red-600">Inactive</span>}
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#1f6d1a]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4">
                  <div className="text-2xl font-bold">
                    {symbol}{formatted} <span className="text-sm font-medium text-gray-500">/ {plan.interval}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.product_limit ? `Up to ${plan.product_limit_label}` : 'Product limit unavailable'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.name === 'Basic' ? 'Best for getting started' : plan.name === 'Pro' ? 'For growing farms' : 'For higher-scale farm operations'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  disabled={subscribing || !plan.active || isCurrentPlan}
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded ${isCurrentPlan ? 'bg-blue-100 text-blue-800 cursor-default' : plan.active ? 'bg-[#1f6d1a] text-white hover:bg-[#14510f]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {subscribing ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmerSubscription;
