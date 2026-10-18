import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiShield, FiShoppingBag, FiUser } from "react-icons/fi";

const roleMeta = {
  customer: {
    title: "Customer Terms & Conditions",
    icon: FiUser,
    summary: "These terms explain what a customer must provide and how buying works on NavaKrishi.",
    requirements: [
      "You must provide accurate name, email, phone, and delivery details.",
      "You agree to use the platform only for lawful purchases and communication.",
      "You are responsible for reviewing product details before placing an order.",
      "Payments, refunds, and cancellations follow the platform's policy and applicable law.",
      "You should keep your account secure and notify us about unauthorized access.",
    ],
    accountInfo: [
      "Full name",
      "Contact email and phone number",
      "Delivery address",
      "Payment and order preferences",
    ],
  },
  farmer: {
    title: "Farmer Terms & Conditions",
    icon: FiShoppingBag,
    summary: "These terms explain what a farmer must provide and how product listings work on NavaKrishi.",
    requirements: [
      "You must provide accurate farm, business, and contact information.",
      "You agree not to list products that are unsafe, illegal, or misleading.",
      "A valid subscription may be required before adding products or publishing listings.",
      "You are responsible for keeping stock, pricing, and product images up to date.",
      "You must fulfill accepted orders according to platform rules and local law.",
    ],
    accountInfo: [
      "Business or farm name",
      "Contact email and phone number",
      "Farm location and address",
      "Subscription and billing details",
    ],
  },
};

const privacyPolicy = [
  "We collect the information you enter during sign up, including your name, email, role, and any role-specific farm or delivery details.",
  "We use your data to create your account, manage orders, provide support, and keep the platform secure.",
  "Farmers may be asked to provide billing and subscription information for product listing access.",
  "We do not sell your personal information. We may share data only when required to process orders, payments, or legal requests.",
  "You can request profile updates through your account settings or by contacting support.",
];

const TermsAndPrivacyModal = ({ open, roleKey = "customer", onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const meta = roleMeta[roleKey] || roleMeta.customer;
  const Icon = meta.icon;

  useEffect(() => {
    if (open) {
      setCanAccept(false);
    }
  }, [open, roleKey]);

  const handleScroll = (event) => {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 12;
    if (reachedBottom) {
      setCanAccept(true);
    }
  };

  const handleAccept = () => {
    if (!canAccept) return;
    onAccept?.();
  };

  const modalTitle = useMemo(() => meta.title, [meta.title]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#e9f6e8] p-3">
              <Icon className="text-[#1f6d1a]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#012d1d]">{modalTitle}</h3>
              <p className="text-sm text-gray-500">Scroll to the bottom to enable acceptance.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-[#012d1d]">
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5" onScroll={handleScroll}>
          <div className="rounded-2xl bg-[#f7fbf5] p-4 text-sm text-gray-600">{meta.summary}</div>

          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700">
            <div className="flex items-start gap-3">
              <FiShield className="mt-1 text-[#1f6d1a]" />
              <p>By creating an account, you agree to follow platform rules, maintain accurate information, and use the service responsibly.</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#012d1d]">Role-specific requirements</h4>
              <ul className="list-disc space-y-2 pl-5">
                {meta.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#012d1d]">Account information we need</h4>
              <ul className="list-disc space-y-2 pl-5">
                {meta.accountInfo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 p-5">
              <h4 className="font-semibold text-[#012d1d]">Privacy Policy</h4>
              <ul className="list-disc space-y-2 pl-5">
                {privacyPolicy.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="text-gray-500">Please read this entire section before accepting.</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-6 py-5">
          <p className="text-sm text-gray-500">
            {canAccept ? "You can now accept the terms." : "Scroll to the bottom to enable acceptance."}
          </p>
          <button type="button" onClick={handleAccept} disabled={!canAccept} className="inline-flex items-center gap-2 rounded-2xl bg-[#1f6d1a] px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300">
            <FiCheckCircle />
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyModal;
