import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiBarChart2,
  FiBell,
  FiSettings,
  FiWifi,
  FiCpu,
  FiMessageSquare,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
} from "react-icons/fi";

import { useState, useEffect } from "react";

import { NavLink, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const links = [
  {
    name: "Overview",
    icon: <FiGrid />,
    path: "/farmer-dashboard",
  },
  {
    name: "Inventory",
    icon: <FiBox />,
    path: "/farmer/inventory",
  },
  {
    name: "Orders",
    icon: <FiShoppingBag />,
    path: "/farmer/orders",
  },
  {
    name: "Notifications",
    icon: <FiBell />,
    path: "/farmer/notifications",
  },
  {
    name: "Subscriptions",
    icon: <FiPlus />,
    children: [
      {
        name: "Subscription plans",
        icon: <FiPlus />,
        path: "/farmer/subscriptions",
      },
      {
        name: "My Subscriptions",
        icon: <FiBarChart2 />,
        path: "/farmer/my-subscriptions",
      },
    ],
  },
  {
    name: "AI Insights",
    icon: <FiCpu />,
    path: "/farmer/ai-insights",
  },
  {
    name: "Agri Assistant",
    icon: <FiMessageSquare />,
    path: "/farmer/assistant",
  },
  {
    name: "Smart Farm IoT",
    icon: <FiWifi />,
    path: "/farmer/iot",
  },
  {
    name: "Prediction Lab",
    icon: <FiBarChart2 />,
    path: "/farmer/prediction-lab",
  },
  {
    name: "Analytics",
    icon: <FiBarChart2 />,
    path: "/farmer/analytics",
  },
  {
    name: "Settings",
    icon: <FiSettings />,
    path: "/farmer/settings",
  },
];
const FarmerSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const farmName = user?.farm_name || user?.first_name || user?.username || "Green Valley Farms";
  const farmInitials = (farmName || "NK")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    const shouldLogout = window.confirm("Do you want to log out of your farmer account?");
    if (!shouldLogout) {
      return;
    }

    setIsLoggingOut(true);
    logout();
    navigate("/sign-in", { replace: true });
  };

  const [openMenus, setOpenMenus] = useState({});

  const location = useLocation();

  // Auto-open submenu if current path matches any child route
  useEffect(() => {
    links.forEach((l) => {
      if (l.children && Array.isArray(l.children)) {
        const matched = l.children.some((c) => location.pathname.startsWith(c.path));
        if (matched) {
          setOpenMenus((s) => ({ ...s, [l.name]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setOpenMenus((s) => ({ ...s, [name]: !s[name] }));
  };

  return (
    <aside className="fixed left-0 top-0 w-67.5 h-screen bg-white border-r border-gray-200 p-5 flex flex-col z-40">
      <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1f6d1a] text-base font-bold text-white shadow-sm">
          {user?.farm_logo_url ? (
            <img
              src={user.farm_logo_url}
              alt={`${farmName} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{farmInitials || "NK"}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-[#012d1d] leading-tight truncate">
            Farmer Portal
          </h1>

          <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
            {farmName}
          </p>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
        {links.map((link) => {
          if (link.children && Array.isArray(link.children)) {
            const isOpen = Boolean(openMenus[link.name]);

            return (
              <div key={link.name}>
                <button
                  type="button"
                  onClick={() => toggleMenu(link.name)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition text-sm text-gray-600 hover:bg-[#f5f5f3]`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    {link.name}
                  </span>
                  <span className="text-lg">{isOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
                </button>

                {isOpen && (
                  <div className="mt-1 ml-3 flex flex-col gap-1 border-l-2 border-emerald-100 pl-2">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition ${
                            isActive
                              ? "bg-[#a4f792] text-[#012d1d] font-bold shadow-sm"
                              : "text-gray-600 hover:bg-[#f5f5f3]"
                          }`
                        }
                      >
                        <span className="text-base">{child.icon}</span>
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm transition ${
                  isActive
                    ? "bg-[#a4f792] text-[#012d1d] font-bold shadow-sm"
                    : "text-gray-600 hover:bg-[#f5f5f3]"
                }`
              }
            >
              <span className="text-lg">
                {link.icon}
              </span>

              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-[#f44336] hover:bg-[#d32f2f] disabled:bg-[#e49a9a] disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold shadow-sm transition active:scale-98 cursor-pointer"
        >
          <FiLogOut className="text-base" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default FarmerSidebar;