import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiBell,
  FiCreditCard,
  FiDroplet,
  FiGlobe,
  FiEdit3,
  FiMapPin,
  FiSettings,
  FiShield,
  FiSliders,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import accountAPI from "../../api/account";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import SettingsHeader from "../../components/farmer/settings/SettingsHeader";
import SettingsFooter from "../../components/farmer/settings/SettingsFooter";
import SaveFooter from "../../components/farmer/settings/SaveFooter";
import BillingTab from './BillingTab';
import billingAPI from '../../api/billing';

const initialProfileState = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  farm_name: "",
  farm_location: "",
  farm_bio: "",
  farm_logo_url: "",
  preferred_currency: "INR",
  unit_of_measure: "metric",
  yield_prediction_alerts: true,
  irrigation_tips_enabled: true,
  order_notifications_enabled: true,
  weekly_summary_emails: true,
};

const initialPasswordState = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const normalizeProfile = (profile) => ({
  username: profile?.username || "",
  email: profile?.email || "",
  first_name: profile?.first_name || "",
  last_name: profile?.last_name || "",
  phone: profile?.phone || "",
  farm_name: profile?.farm_name || "",
  farm_location: profile?.farm_location || "",
  farm_bio: profile?.farm_bio || "",
  farm_logo_url: profile?.farm_logo_url || "",
  preferred_currency: profile?.preferred_currency || "INR",
  unit_of_measure: profile?.unit_of_measure || "metric",
  yield_prediction_alerts: profile?.yield_prediction_alerts ?? true,
  irrigation_tips_enabled: profile?.irrigation_tips_enabled ?? true,
  order_notifications_enabled: profile?.order_notifications_enabled ?? true,
  weekly_summary_emails: profile?.weekly_summary_emails ?? true,
});

const settingGroups = [
  {
    title: "Yield prediction alerts",
    description: "Get notified when the model flags strong harvest windows or yield risks.",
    name: "yield_prediction_alerts",
    icon: FiBell,
  },
  {
    title: "Irrigation tips",
    description: "Receive moisture and watering recommendations based on your crop mix.",
    name: "irrigation_tips_enabled",
    icon: FiDroplet,
  },
  {
    title: "Order notifications",
    description: "Stay informed when new orders arrive or existing orders change status.",
    name: "order_notifications_enabled",
    icon: FiSettings,
  },
  {
    title: "Weekly summary email",
    description: "Get a weekly digest of inventory, orders, and top movers in your farm store.",
    name: "weekly_summary_emails",
    icon: FiGlobe,
  },
];

const FarmerSettings = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(initialProfileState);
  const [password, setPassword] = useState(initialPasswordState);
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [passwordNotice, setPasswordNotice] = useState({ type: "", text: "" });
  const [subscription, setSubscription] = useState(null);
  const [billingMethod, setBillingMethod] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const formatPaymentLabel = (raw) => {
    if (!raw) return null;
    const r = String(raw).trim();
    // common values: 'card', 'upi', 'netbanking', 'wallet', 'razorpay', or masked like '•••• 4242'
    if (/^\u2022|\*|\.|•/.test(r) || /\d{4}$/.test(r)) {
      return r; // already masked or ends with last4
    }

    const lowered = r.toLowerCase();
    if (lowered.includes('card') || lowered.includes('visa') || lowered.includes('master') || lowered.includes('amex')) {
      return 'Card ••••';
    }
    if (lowered.includes('upi')) return 'UPI';
    if (lowered.includes('net')) return 'Netbanking';
    if (lowered.includes('wallet')) return 'Wallet';
    if (lowered.includes('razor')) return 'Razorpay';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };
  const fmtDate = (val) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return d.toLocaleDateString();
    } catch (e) {
      return val;
    }
  };
  const originalProfileRef = useRef(initialProfileState);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await accountAPI.getProfile();
        const nextProfile = normalizeProfile(data);

        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
        setLogoPreview(nextProfile.farm_logo_url || "");
        setLogoFile(null);
        originalProfileRef.current = nextProfile;
        setIsEditing(false);
        updateUser(nextProfile);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNotice({
          type: "error",
          text: "We could not load your profile right now. Please refresh the page or try again later.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.username,
      profile.email,
      profile.farm_name,
      profile.farm_location,
      profile.phone,
      profile.farm_bio,
      profile.farm_logo_url,
    ];

    const filled = fields.filter((field) => String(field || "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const farmInitials = useMemo(() => {
    const source = profile.farm_name || user?.first_name || profile.username || "NK";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile.farm_name, profile.username, user?.first_name]);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfileRef.current);

  const handleProfileChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setLogoFile(selectedFile);
    setLogoPreview(URL.createObjectURL(selectedFile));
    setIsEditing(true);
    setNotice({ type: "", text: "" });
  };

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  useEffect(() => {
    let isMounted = true;

    const loadSubscriptionSummary = async () => {
      try {
        const subsRes = await billingAPI.mySubscriptions();
        const subs = subsRes.data || [];
        // prefer active subscription
        const active = subs.find((s) => (s.status || '').toLowerCase() === 'active') || subs[0] || null;
        if (isMounted) setSubscription(active);

        // fetch recent invoices to infer payment method and details
        try {
          const invRes = await billingAPI.getInvoices();
          const invoices = invRes.data || [];
          const latest = invoices[0] || null;
          if (isMounted) {
            setLastInvoice(latest);
            setBillingMethod(formatPaymentLabel(latest?.payment_method || null));
          }
        } catch (e) {
          if (isMounted) {
            setLastInvoice(null);
            setBillingMethod(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setSubscription(null);
          setBillingMethod(null);
        }
      }
    };

    loadSubscriptionSummary();

    return () => { isMounted = false; };
  }, []);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPassword((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setProfile(originalProfileRef.current);
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(originalProfileRef.current.farm_logo_url || "");
    setPassword(initialPasswordState);
    setNotice({ type: "", text: "" });
    setPasswordNotice({ type: "", text: "" });
  };

  const handleEditAction = () => {
    if (isEditing) {
      handleSaveProfile();
      return;
    }

    setIsEditing(true);
    setNotice({ type: "", text: "" });
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setNotice({ type: "", text: "" });

      const payload = new FormData();

      Object.entries(profile).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "farm_logo_url") {
          payload.append(key, typeof value === "boolean" ? String(value) : value);
        }
      });

      if (logoFile) {
        payload.append("farm_logo", logoFile);
      }

      const savedProfile = await accountAPI.updateProfile(payload);
      const normalizedProfile = normalizeProfile(savedProfile);

      setProfile(normalizedProfile);
      setLogoPreview(normalizedProfile.farm_logo_url || "");
      setLogoFile(null);
      originalProfileRef.current = normalizedProfile;
      updateUser(savedProfile);
      setIsEditing(false);
      setNotice({
        type: "success",
        text: "Your farm profile was updated successfully.",
      });
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data?.error || "Unable to save your profile right now.";
      setNotice({
        type: "error",
        text: detail,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();

    if (!password.current_password || !password.new_password || !password.confirm_password) {
      setPasswordNotice({
        type: "error",
        text: "Fill in your current password, new password, and confirmation.",
      });
      return;
    }

    if (password.new_password !== password.confirm_password) {
      setPasswordNotice({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordNotice({ type: "", text: "" });

      const response = await accountAPI.changePassword(password);
      setPassword(initialPasswordState);
      setPasswordNotice({
        type: "success",
        text: response?.message || "Password updated successfully.",
      });
    } catch (error) {
      const detail = error?.response?.data?.error || error?.response?.data?.detail || "Unable to update the password right now.";
      setPasswordNotice({
        type: "error",
        text: detail,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="pb-40">
      <SettingsHeader />

      <section className="mt-10 rounded-4xl border border-[#dfe8d8] bg-linear-to-br from-[#f6fbf2] via-[#eef7e7] to-[#e6f2dd] p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f6b23]">
              Farmer profile
            </p>
            <h2 className="mt-3 text-4xl font-bold text-[#012d1d] md:text-5xl">
              Keep your farm identity and preferences in sync.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#476356] md:text-lg">
              Update your username, farm name, location, contact details, alert preferences, and password from one place. Changes save directly to your account profile.
            </p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#1f6d1a] text-xl font-bold text-white">
                {logoPreview ? (
                  <img src={logoPreview} alt="Farm logo preview" className="h-full w-full object-cover" />
                ) : (
                  <span>{farmInitials || "NK"}</span>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Profile completion</p>
                <p className="text-3xl font-bold text-[#012d1d]">{profileCompletion}%</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEditAction}
              disabled={loading || savingProfile}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#012d1d] px-5 py-4 font-semibold text-white transition hover:bg-[#021f14] disabled:cursor-not-allowed disabled:bg-[#74837d]"
            >
              {isEditing ? (
                <>
                  <FiEdit3 />
                  {savingProfile ? "Saving Profile..." : "Save Profile"}
                </>
              ) : (
                <>
                  <FiEdit3 />
                  Edit Profile
                </>
              )}
            </button>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e6efe2]">
              <div
                className="h-full rounded-full bg-[#1f6d1a] transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {notice.text && (
          <div className={`mt-6 rounded-2xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-[#eef8e8] text-[#2f6b23]" : "bg-[#fee2e2] text-[#b42318]"}`}>
            {notice.text}
          </div>
        )}
      </section>

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <FiUser className="text-2xl text-[#1f6d1a]" />
              <h2 className="text-3xl font-bold text-[#012d1d]">Farm profile</h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Username</label>
                <input
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Your username"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Email address</label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled
                  className="w-full rounded-2xl border border-gray-300 bg-gray-100 px-5 py-4 text-gray-500 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Email used for login"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Email is fixed after signup and cannot be changed from settings.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">First name</label>
                <input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Last name</label>
                <input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Last name"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Phone number</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Contact number"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Farm name</label>
                <input
                  name="farm_name"
                  value={profile.farm_name}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Farm or brand name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600">
                  <FiMapPin className="text-[#1f6d1a]" />
                  Farm location
                </label>
                <input
                  name="farm_location"
                  value={profile.farm_location}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Village, district, state"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600">
                  <FiUpload className="text-[#1f6d1a]" />
                  Farm logo
                </label>
                <div className="rounded-3xl border border-dashed border-gray-300 bg-[#fafafa] p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Selected farm logo" className="h-full w-full object-cover" />
                      ) : (
                        <FiUpload className="text-3xl text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={!isEditing}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-[#012d1d] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-[#021f14] disabled:cursor-not-allowed disabled:opacity-70"
                      />

                      <p className="text-sm text-gray-500">
                        JPG, PNG, or WEBP. Use a clear square logo for the best header preview.
                      </p>

                      {logoFile && (
                        <p className="text-sm font-medium text-[#1f6d1a]">
                          Selected: {logoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-3 block text-sm font-medium text-gray-600">Farm bio</label>
                <textarea
                  name="farm_bio"
                  rows="5"
                  value={profile.farm_bio}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Share your farm story, growing practices, and what you sell best."
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <FiSliders className="text-2xl text-[#1f6d1a]" />
              <h2 className="text-3xl font-bold text-[#012d1d]">Platform preferences</h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Preferred currency</label>
                <select
                  name="preferred_currency"
                  value={profile.preferred_currency}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Unit of measure</label>
                <select
                  name="unit_of_measure"
                  value={profile.unit_of_measure}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                >
                  <option value="metric">Metric (kg, hectares)</option>
                  <option value="imperial">Imperial (lbs, acres)</option>
                </select>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {settingGroups.map((setting) => {
                const Icon = setting.icon;

                return (
                  <div key={setting.name} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-5 py-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-[#f5f5f3] p-3 text-[#1f6d1a]">
                        <Icon />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#012d1d]">{setting.title}</h3>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">{setting.description}</p>
                      </div>
                    </div>

                    <label className={`relative inline-flex items-center ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
                      <input
                        type="checkbox"
                        name={setting.name}
                        checked={Boolean(profile[setting.name])}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="peer sr-only"
                      />
                      <div className="peer h-8 w-14 rounded-full bg-gray-300 transition peer-checked:bg-[#1f6d1a]" />
                      <div className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-6" />
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-2xl text-[#1f6d1a]" />
              <h2 className="text-3xl font-bold text-[#012d1d]">Billing</h2>
            </div>

            <div className="mt-6">
              <BillingTab />
            </div>
          </section>
        </div>

        <div className="space-y-8 xl:col-span-4">
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <FiShield className="text-2xl text-[#1f6d1a]" />
              <h2 className="text-3xl font-bold text-[#012d1d]">Account security</h2>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f5f5f3] p-4">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="mt-1 font-semibold text-[#012d1d]">{profile.email || user?.email || "No email set"}</p>
            </div>

            <form onSubmit={handleSavePassword} className="mt-8 space-y-5">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Current password</label>
                <input
                  type="password"
                  name="current_password"
                  value={password.current_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">New password</label>
                <input
                  type="password"
                  name="new_password"
                  value={password.new_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Create a new password"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-600">Confirm password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={password.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:border-[#1f6d1a] focus:outline-none"
                  placeholder="Repeat the new password"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full rounded-2xl bg-[#012d1d] px-6 py-4 font-semibold text-white transition hover:bg-[#021f14] disabled:cursor-not-allowed disabled:bg-[#74837d]"
              >
                {savingPassword ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            {passwordNotice.text && (
              <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${passwordNotice.type === "success" ? "bg-[#eef8e8] text-[#2f6b23]" : "bg-[#fee2e2] text-[#b42318]"}`}>
                {passwordNotice.text}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-2xl text-[#1f6d1a]" />
              <h2 className="text-3xl font-bold text-[#012d1d]">Subscription & billing</h2>
            </div>

            <div className="mt-6 rounded-3xl bg-[#f5f5f3] p-6 border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current plan</p>
                    <h3 className="mt-2 text-2xl font-bold text-[#012d1d]">{subscription?.plan?.name || 'Free'}</h3>
                </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${subscription && (subscription.status||'').toLowerCase() === 'active' ? 'bg-[#dff5d8] text-[#1f6d1a]' : 'bg-gray-200 text-gray-600'}`}>
                    {(subscription?.status || 'inactive').toUpperCase()}
                  </span>
              </div>

              <div className="mt-5 text-sm leading-6 text-gray-600">
                <div>Billing summary for your current plan.</div>
                <div className="mt-3">Amount: <span className="font-semibold">{subscription?.plan ? `${subscription.plan.currency || 'INR'} ${subscription.plan.amount || 0}` : '—'}</span></div>
                <div className="mt-1">Next billing date: <span className="font-semibold">{fmtDate(subscription?.current_end || subscription?.end_date)}</span></div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4">
                <p className="text-sm text-gray-500">Default payment method</p>
                <p className="mt-1 font-semibold text-[#012d1d]">{billingMethod ? billingMethod : 'No payment method on file'}</p>
                {lastInvoice && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div>Last payment: <span className="font-semibold">{(lastInvoice.total_amount !== undefined ? `${lastInvoice.total_amount}` : (lastInvoice.totalAmount || '—'))} {lastInvoice.currency || (subscription?.plan?.currency || '')}</span> • {fmtDate(lastInvoice.created_at || lastInvoice.createdAt)}</div>
                    <div className="mt-1">Payment ID: <span className="font-mono text-sm">{lastInvoice.payment_id || lastInvoice.paymentId || lastInvoice.payment_order_id || '—'}</span></div>
                    <div className="mt-1">Gateway: <span className="font-semibold">{lastInvoice.payment_gateway || lastInvoice.paymentGateway || '—'}</span></div>
                  </div>
                )}
                <button onClick={() => navigate('/farmer/my-subscriptions')} className="mt-4 w-full rounded-2xl bg-[#012d1d] text-white py-3 font-semibold hover:bg-[#021f14]">Manage subscription</button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#dfe8d8] bg-[#f6fbf2] p-8 shadow-sm">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="mt-1 text-xl text-[#a15c09]" />
              <div>
                <h2 className="text-2xl font-bold text-[#012d1d]">Tip</h2>
                <p className="mt-2 text-sm leading-6 text-[#476356]">
                  Keep your farm name, logo URL, and location accurate so customers and marketplace recommendations stay aligned with your listings.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <SettingsFooter />

      {isEditing && (
        <SaveFooter
          onCancel={handleReset}
          onSave={handleSaveProfile}
          isSaving={savingProfile}
          disableSave={!hasChanges || loading}
          saveLabel="Save Profile"
          cancelLabel="Cancel"
        />
      )}
    </div>
  );
};

export default FarmerSettings;
