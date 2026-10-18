import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  FiSearch,
  FiShoppingCart,
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems, toggleDrawer } = useCart();

  // Dropdown
  const [showDropdown, setShowDropdown] =
    useState(false);

  // Notifications
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // Mobile Menu
  const [mobileMenu, setMobileMenu] =
    useState(false);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Dropdown Ref
  const dropdownRef = useRef();
  const notificationRef = useRef();
  const searchRef = useRef();
  const desktopSearchInputRef = useRef();

  // Close Dropdown Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    const currentSearch = new URLSearchParams(location.search).get("search") || "";
    setSearchValue(currentSearch);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (showSearch && desktopSearchInputRef.current) {
      desktopSearchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      setLoadingNotifications(true);

      try {
        if (!user) {
          if (mounted) {
            setNotifications([]);
          }
          return;
        }

        const response = await API.get("/notifications/");

        if (mounted) {
          setNotifications(
            response.data.map((item) => ({
              id: item.id,
              title: item.title,
              message: item.message,
              time: new Date(item.created_at).toLocaleDateString(),
              unread: !item.is_read,
              type: item.notification_type,
              relatedOrderNumber: item.related_order_number,
            }))
          );
        }
      } catch (error) {
        if (mounted) {
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoadingNotifications(false);
        }
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Logout
  const handleLogout = () => {
    logout();

    setShowDropdown(false);
    setShowNotifications(false);
    navigate("/");
  };

  const unreadNotifications = notifications.filter((item) => item.unread).length;

  const toggleNotifications = async () => {
    const willOpen = !showNotifications;

    setShowNotifications(willOpen);
    setShowDropdown(false);

    if (willOpen && user) {
      try {
        await API.post("/notifications/mark_all_read/");
        setNotifications((current) =>
          current.map((item) => ({ ...item, unread: false }))
        );
      } catch (error) {
        // keep the dropdown usable even if the read-state update fails
      }
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();
    const queryParams = new URLSearchParams();

    if (query) {
      queryParams.set("search", query);
    }

    const queryString = queryParams.toString();
    navigate(queryString ? `/marketplace?${queryString}` : "/marketplace");

    setShowSearch(false);
    setMobileMenu(false);
  };

  // Nav Links
  const navLinks = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Marketplace",
      path: "/marketplace",
    },

    {
      name: "Seasonal Discovery",
      path: "/seasonal-discovery",
    },

    {
      name: "Support",
      path: "/support",
    },

    {
      name: "Impact",
      path: "/impact",
    },

    {
      name: "About",
      path: "/about",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">

      <div className="max-w-360 mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-14">

          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-bold text-[#012d1d] font-['Devil_Breeze']"
          >
            NavaKrishi
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative pb-1 font-semibold transition-all after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-[#1f6d1a] after:transition-all hover:after:w-full ${location.pathname === link.path
                  ? "text-[#1f6d1a] after:w-full"
                  : "text-gray-600 after:w-0 hover:text-[#1f6d1a]"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          {/* Icons */}
          <div className="flex items-center gap-5">
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => setShowSearch((current) => !current)}
                className="text-gray-600 hover:text-[#1f6d1a] transition"
                aria-label="Open search"
              >
                <FiSearch className="text-2xl" />
              </button>

              {showSearch && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-12 w-95 max-w-[calc(100vw-4rem)] bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-3 border border-gray-100"
                >
                  <FiSearch className="text-gray-500" />

                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search veggies, spices..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </form>
              )}
            </div>
            <div className="relative">

              <button
                type="button"
                onClick={toggleDrawer}
                className="text-gray-600 hover:text-[#1f6d1a] transition"
                aria-label="Open cart"
              >
                <FiShoppingCart className="text-2xl" />
              </button>

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#1f6d1a] text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>

            {/* Notification */}
            <div
              className="relative"
              ref={notificationRef}
            >
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative text-gray-600 hover:text-[#1f6d1a] transition"
                aria-label="Open notifications"
              >
                <FiBell className="text-2xl" />

                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-2 border-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#012d1d] text-lg">Notifications</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {loadingNotifications ? "Loading updates..." : `${notifications.length} recent updates`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!user) return;

                        try {
                          await API.post("/notifications/mark_all_read/");
                          setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
                        } catch (error) {
                          setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
                        }
                      }}
                      className="text-sm font-semibold text-[#1f6d1a] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-sm text-gray-500">
                        {user ? "No notifications yet." : "Sign in to see your notifications."}
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`px-5 py-4 border-b border-gray-50 hover:bg-[#f8fcf6] transition ${item.unread ? "bg-[#f2fbef]" : "bg-white"}`}
                        >
                          <div className="flex items-start gap-4">
                            <span className="mt-1 w-2.5 h-2.5 rounded-full bg-[#1f6d1a] shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <h4 className="font-semibold text-[#012d1d]">
                                  {item.title}
                                </h4>
                                <span className="text-xs text-gray-400 shrink-0">
                                  {item.time}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 leading-6">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AUTH */}
            {user ? (
              <div
                className="relative"
                ref={dropdownRef}
              >

                {/* Avatar */}
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-11 h-11 rounded-full bg-[#012d1d] text-white border-2 border-[#a4f792] flex items-center justify-center cursor-pointer hover:scale-105 transition overflow-hidden"
                  aria-label="Open account menu"
                >
                  {user?.avatar_url || user?.avatar ? (
                    <img
                      src={user?.avatar_url || user?.avatar}
                      alt={user?.first_name || user?.username || "User avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : user?.first_name || user?.username ? (
                    <span className="text-sm font-semibold">
                      {(user?.first_name || user?.username || "U").charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <FiUser className="text-lg" />
                  )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 top-16 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* User */}
                    <div className="p-5 border-b border-gray-100">

                      <div className="flex items-center gap-4">

                        <img
                          src={user?.avatar_url || user?.avatar || "https://i.pravatar.cc/100"}
                          alt={user?.first_name || user?.username || "User avatar"}
                          className="w-14 h-14 rounded-full object-cover"
                        />

                        <div>

                          <h3 className="font-bold text-[#012d1d]">
                            {user?.first_name || user?.username || "Account"}
                          </h3>

                          <p className="text-sm text-[#1f6d1a] mt-1">
                            {user?.role || "customer"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-2">

                      <Link
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-[#f5fff2] transition"
                      >
                        <FiUser />

                        <span>
                          Account
                        </span>
                      </Link>

                      <hr className="my-2 border-gray-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 transition"
                      >
                        <FiLogOut />

                        <span>
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/sign-in">

                <button className="bg-[#012d1d] hover:bg-[#1f6d1a] text-white px-7 py-3 rounded-2xl font-semibold transition-all shadow-lg active:scale-95">
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="lg:hidden text-2xl text-[#012d1d]"
            >
              {mobileMenu ? (
                <FiX />
              ) : (
                <FiMenu />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">

          <div className="px-6 py-6 flex flex-col gap-5">

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() =>
                  setMobileMenu(false)
                }
                className={`font-semibold transition ${location.pathname === link.path
                  ? "text-[#1f6d1a]"
                  : "text-gray-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-3 flex items-center rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3"
            >
              <FiSearch className="text-gray-500" />

              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search veggies, spices..."
                className="w-full bg-transparent px-3 outline-none"
              />
            </form>

            {user ? (
              <div className="flex items-center gap-3 pt-2">
                <Link
                  to="/settings"
                  onClick={() => setMobileMenu(false)}
                  className="text-[#1f6d1a] font-semibold"
                >
                  Account
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-500 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/sign-in" onClick={() => setMobileMenu(false)}>
                <button className="bg-[#012d1d] hover:bg-[#1f6d1a] text-white px-7 py-3 rounded-2xl font-semibold transition-all shadow-lg active:scale-95 w-full">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;