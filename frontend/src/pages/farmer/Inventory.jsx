import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiEdit3,
  FiImage,
  FiPackage,
  FiPlusCircle,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import { categoriesAPI, productsAPI } from "../../api/marketplace";
import billingAPI from "../../api/billing";
import { useAuth } from "../../context/AuthContext";
import showConfirm from "../../utils/confirm";
import showToast from "../../utils/toast";

const emptyForm = {
  title: "",
  category_id: "",
  description: "",
  price: "",
  unit: "kg",
  quantity_available: "",
  image: "",
  image_urls: "",
  badge: "",
  badge_color: "",
  is_active: true,
};

const lowStockThreshold = 20;

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);

    try {
      const [productList, categoryList, subscriptionList] = await Promise.all([
        productsAPI.getMyProducts(),
        categoriesAPI.getAllCategories(),
        billingAPI.mySubscriptions(),
      ]);

      setProducts(Array.isArray(productList) ? productList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
      setSubscriptions(Array.isArray(subscriptionList?.data) ? subscriptionList.data : Array.isArray(subscriptionList) ? subscriptionList : []);
    } catch (error) {
      setProducts([]);
      setCategories([]);
      setSubscriptions([]);
      showToast("Unable to load inventory right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // reload subscriptions/products when other pages signal a subscription change
  useEffect(() => {
    const onSubscriptionChanged = () => {
      loadData();
    };
    window.addEventListener('subscription:changed', onSubscriptionChanged);
    return () => window.removeEventListener('subscription:changed', onSubscriptionChanged);
  }, []);

  const resetForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);
  };

  const openForEdit = (product) => {
    setEditingProductId(product.id);
    setForm({
      title: product.title || "",
      category_id: product.category?.id ? String(product.category.id) : "",
      description: product.description || "",
      price: product.price ?? "",
      unit: product.unit || "kg",
      quantity_available: product.quantity_available ?? "",
      image: product.image || "",
      image_urls: Array.isArray(product.images)
        ? product.images.map((item) => item.image).filter(Boolean).join(", ")
        : "",
      badge: product.badge || "",
      badge_color: product.badge_color || "",
      is_active: Boolean(product.is_active),
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => {
    const payload = {
      farmer_id: user?.id,
      title: form.title.trim(),
      category_id: Number(form.category_id),
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      quantity_available: Number(form.quantity_available),
      image: form.image.trim(),
      badge: form.badge.trim(),
      badge_color: form.badge_color.trim(),
      is_active: form.is_active,
    };

    const imageUrls = form.image_urls
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (imageUrls.length > 0) {
      payload.image_urls = imageUrls;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!user?.id) {
      showToast("Please sign in again to save inventory changes.");
      return;
    }

    if (!form.title.trim() || !form.category_id || !form.price || !form.quantity_available) {
      showToast("Title, category, price, and stock are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (editingProductId) {
        await productsAPI.updateProduct(editingProductId, payload);
        showToast("Product updated successfully.");
      } else {
        await productsAPI.createProduct(payload);
        showToast("Product added successfully.");
      }

      await loadData();
      resetForm();
    } catch (error) {
      const responseData = error?.response?.data;
      if (typeof responseData?.detail === "string") {
        showToast(responseData.detail);
      } else if (responseData && typeof responseData === "object") {
        const firstField = Object.keys(responseData)[0];
        const firstError = responseData[firstField];
        const message = Array.isArray(firstError)
          ? `${firstField}: ${firstError[0]}`
          : `${firstField}: ${String(firstError)}`;
        showToast(message);
      } else {
        showToast("Unable to save the product.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = await showConfirm(`Delete ${product.title}? This cannot be undone.`);
    if (!ok) return;

    try {
      await productsAPI.deleteProduct(product.id);
      showToast("Product deleted.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProductId === product.id) {
        resetForm();
      }
    } catch (error) {
      showToast("Unable to delete product.");
    }
  };

  const toggleActive = async (product) => {
    try {
      const updated = await productsAPI.partialUpdateProduct(product.id, {
        is_active: !product.is_active,
      });
      setProducts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast(updated.is_active ? "Product activated." : "Product paused.");
    } catch (error) {
      showToast("Unable to update product status.");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesSearch = !query || [product.title, product.description, product.badge]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

        const stock = Number(product.quantity_available || 0);
        const isLowStock = stock <= lowStockThreshold;

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? Boolean(product.is_active)
              : statusFilter === "inactive"
                ? !product.is_active
                : isLowStock;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  }, [products, search, statusFilter]);

  const stats = useMemo(() => {
    const activeCount = products.filter((item) => item.is_active).length;
    const lowStockCount = products.filter((item) => Number(item.quantity_available || 0) <= lowStockThreshold).length;
    const inventoryValue = products.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity_available || 0),
      0
    );

    return { activeCount, lowStockCount, inventoryValue };
  }, [products]);

  const currentSubscription = useMemo(() => {
    const nonCancelled = subscriptions.filter((sub) => (sub.status || '').toLowerCase() !== 'cancelled');
    const activeSubs = nonCancelled.filter((sub) => (sub.status || '').toLowerCase() === 'active');
    const pendingSubs = nonCancelled.filter((sub) => (sub.status || '').toLowerCase() === 'created');
    return activeSubs[0] || pendingSubs[0] || nonCancelled[0] || subscriptions[0] || null;
  }, [subscriptions]);

  const productLimit = currentSubscription?.plan?.product_limit ?? null;
  const productLimitLabel = currentSubscription?.plan?.product_limit_label || 'No subscription';
  const remainingProducts = productLimit == null ? null : Math.max(productLimit - products.length, 0);
  const canAddNewProduct = editingProductId ? true : productLimit == null ? true : products.length < productLimit;
  const currentSubscriptionStatus = (currentSubscription?.status || 'no subscription').toUpperCase();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-4xl border border-[#dfe8d8] bg-linear-to-br from-[#f6fbf2] via-[#eef7e7] to-[#e6f2dd] p-6 md:p-8 shadow-sm">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#a4f792]/30 blur-3xl" />
        <div className="absolute -bottom-12 left-24 h-36 w-36 rounded-full bg-[#1f6d1a]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[#2f6b23] backdrop-blur">
              <FiPackage />
              Live inventory management
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#012d1d] md:text-6xl">
              Manage your products.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#476356] md:text-lg">
              Add, update, pause, and remove your farm products from one place. This page is wired directly to your backend product API.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#012d1d] ring-1 ring-[#d6e4cf] transition hover:bg-[#f7fbf5]"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                if (!canAddNewProduct) {
                  showToast('You need an active subscription to add new products.');
                  navigate('/farmer/subscriptions');
                  return;
                }
                navigate('/farmer/add-product');
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1f6d1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#175515]"
            >
              <FiPlusCircle />
              Full product builder
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#dfe8d8] bg-[#f6fbf2] p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#2f6b23]">Current subscription</p>
            <h3 className="mt-1 text-2xl font-bold text-[#012d1d]">
              {currentSubscription?.plan?.name || 'No active subscription'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {productLimit == null
                ? 'Subscribe to start listing products.'
                : `You can list up to ${productLimitLabel}.`}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Status: {currentSubscriptionStatus}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Used</p>
              <p className="text-xl font-bold text-[#012d1d]">{products.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Remaining</p>
              <p className="text-xl font-bold text-[#012d1d]">
                {remainingProducts == null ? '∞' : remainingProducts}
              </p>
            </div>
            <Link
              to="/farmer/subscriptions"
              className="inline-flex items-center justify-center rounded-2xl bg-[#1f6d1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#175515]"
            >
              Upgrade plan
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total products</p>
          <p className="mt-2 text-3xl font-bold text-[#012d1d]">{products.length}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Active products</p>
          <p className="mt-2 text-3xl font-bold text-[#012d1d]">{stats.activeCount}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Inventory value</p>
          <p className="mt-2 text-3xl font-bold text-[#012d1d]">{formatCurrency(stats.inventoryValue)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2f6b23]">{editingProductId ? "Edit product" : "Add product"}</p>
                <h2 className="mt-1 text-2xl font-bold text-[#012d1d]">
                  {editingProductId ? "Update the selected item" : "Create a new listing"}
                </h2>
              </div>
              {editingProductId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#f5f5f3] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#ecebe7]"
                >
                  <FiX />
                  Cancel
                </button>
              )}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Product title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Organic Tomatoes"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Unit</label>
                  <input
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="kg / lb / pcs"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe origin, freshness, and use cases"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Stock</label>
                  <input
                    name="quantity_available"
                    type="number"
                    min="0"
                    value={form.quantity_available}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Main image URL</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Extra image URLs</label>
                <textarea
                  name="image_urls"
                  value={form.image_urls}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Comma-separated URLs"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Badge</label>
                  <input
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    placeholder="Organic / Fresh / Seasonal"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Badge color</label>
                  <input
                    name="badge_color"
                    value={form.badge_color}
                    onChange={handleChange}
                    placeholder="bg-green-100 text-green-800"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <span className="text-sm font-semibold text-gray-700">Product is active in marketplace</span>
              </label>

              <button
                type="submit"
                disabled={saving || !canAddNewProduct}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6d1a] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#175515] disabled:cursor-not-allowed disabled:bg-[#98b494]"
              >
                <FiPlusCircle />
                {saving ? "Saving..." : editingProductId ? "Update product" : canAddNewProduct ? "Add product" : "Plan limit reached"}
              </button>
              {!editingProductId && !canAddNewProduct && (
                <p className="text-sm text-red-600">
                  You have reached your plan limit. Upgrade your subscription to add more products.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-4xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#012d1d]">Your inventory</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {loading ? "Loading products..." : `${filteredProducts.length} visible of ${products.length} total`}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search inventory"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 outline-none focus:border-[#1f6d1a] md:w-80"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 outline-none focus:border-[#1f6d1a]"
                >
                  <option value="all">All products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="low-stock">Low stock</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-gray-500">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-gray-500">
                <FiImage className="text-5xl text-gray-300" />
                <p className="text-lg font-semibold text-[#012d1d]">No products found</p>
                <p className="max-w-md text-sm">
                  Try changing the search or filters, or add a new product using the form on the left.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-[#f5f5f3] text-left text-sm font-semibold text-gray-600">
                      <tr>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Stock</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredProducts.map((product) => {
                        const stock = Number(product.quantity_available || 0);
                        const isLowStock = stock <= lowStockThreshold;

                        return (
                          <tr key={product.id} className="transition hover:bg-[#fafafa]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-[#f8faf7]">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                      <FiImage className="text-2xl" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-[#012d1d]">{product.title}</p>
                                  <p className="mt-1 text-sm text-gray-400">
                                    {product.badge || "No badge"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-[#e6e3d0] px-4 py-2 text-sm font-medium text-[#48473a]">
                                {product.category?.name || "Uncategorized"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-lg font-bold text-[#1f6d1a]">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <div className="h-2.5 w-40 overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className={`h-full rounded-full ${isLowStock ? "bg-red-500" : "bg-[#1f6d1a]"}`}
                                    style={{ width: `${Math.max(12, Math.min(stock, 100))}%` }}
                                  />
                                </div>
                                <p className={`text-sm font-semibold ${isLowStock ? "text-red-500" : "text-gray-600"}`}>
                                  {stock} units {isLowStock ? "(Low stock)" : "available"}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${product.is_active ? "bg-[#e6f4e3] text-[#1f6d1a]" : "bg-gray-100 text-gray-500"}`}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openForEdit(product)}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-[#f5f5f3] px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#ecebe7]"
                                >
                                  <FiEdit3 />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleActive(product)}
                                  className="rounded-2xl bg-[#eef8e8] px-3 py-2 text-sm font-semibold text-[#2f6b23] transition hover:bg-[#e1f3dc]"
                                >
                                  {product.is_active ? "Pause" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product)}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-[#fff1f0] px-3 py-2 text-sm font-semibold text-[#b42318] transition hover:bg-[#ffe2df]"
                                >
                                  <FiTrash2 />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-4xl border border-[#f3e4c8] bg-[#fff9ef] p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-3 text-[#a46b00] shadow-sm">
                <FiAlertTriangle />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5f4100]">Inventory note</h3>
                <p className="mt-2 text-sm leading-6 text-[#7a5a20]">
                  Low stock is flagged at {lowStockThreshold} units or fewer. You can keep one listing live and pause it instantly from the table while you update the form.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inventory;