import API from './axios';

const billingAPI = {
  getPlans: () => API.get('/payments/razorpay/subscription/plans/'),
  createSubscription: (planId) => API.post('/payments/razorpay/subscription/create/', { plan_id: planId }),
  mySubscriptions: () => API.get('/payments/razorpay/subscription/my/'),
  cancelSubscription: (subscriptionId, cancelAtEnd = false) => API.post('/payments/razorpay/subscription/cancel/', { subscription_id: subscriptionId, cancel_at_end: cancelAtEnd ? 1 : 0 }),
  setAutoRenew: (subscriptionId, autoRenew) => API.post('/payments/razorpay/subscription/auto-renew/', { subscription_id: subscriptionId, auto_renew: autoRenew ? 1 : 0 }),
  renewSubscription: (subscriptionId) => API.post('/payments/razorpay/subscription/renew/', { subscription_id: subscriptionId }),
  getInvoices: () => API.get('/payments/invoices/'),
};

export default billingAPI;
