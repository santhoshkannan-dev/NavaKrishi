import {
  FiUser,
  FiMapPin,
  FiShield,
  FiBell,
  FiCreditCard,
  FiPackage,
  FiLogOut,
} from "react-icons/fi";

const menu = [
  { id: "personal-profile", title: "Personal Profile", icon: <FiUser />, active: true },
  { id: "shipping-addresses", title: "Shipping Addresses", icon: <FiMapPin /> },
  { id: "security-privacy", title: "Security & Privacy", icon: <FiShield /> },
  { id: "notifications", title: "Notifications", icon: <FiBell /> },
  { id: "billing-payments", title: "Billing & Payments", icon: <FiCreditCard /> },
  { id: "order-details", title: "Order Details", icon: <FiPackage /> },
];

const SettingsSidebar = () => {
  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="w-full md:w-72">
      <div className="bg-[#f5f5f5] rounded-3xl border border-gray-200 p-6 h-full flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-[#012d1d]">Settings</h2>
          <p className="text-gray-500 mt-2">Manage your account</p>
        </div>

        <nav className="space-y-3 mt-10">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
                item.active ? "bg-[#a4f792] text-[#1f6d1a]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {item.icon}

              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>

        <button className="mt-auto flex items-center gap-4 text-red-500 px-5 py-4">
          <FiLogOut />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default SettingsSidebar;