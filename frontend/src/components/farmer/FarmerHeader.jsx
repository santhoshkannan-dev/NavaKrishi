import { useMemo } from "react";

import { useAuth } from "../../context/AuthContext";

const FarmerHeader = () => {
  const { user } = useAuth();

  const displayName = useMemo(() => {
    return user?.farm_name || user?.first_name || user?.username || "Green Valley Farms";
  }, [user?.farm_name, user?.first_name, user?.username]);

  const ownerName = useMemo(() => {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return fullName || user?.username || "Farmer";
  }, [user?.first_name, user?.last_name, user?.username]);

  const farmInitials = useMemo(() => {
    const source = user?.farm_name || user?.first_name || user?.username || "NK";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.farm_name, user?.first_name, user?.username]);

  const greeting = useMemo(() => {
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const parts = timeStr.split(' ');
      const period = parts.length > 1 ? String(parts.pop()).toUpperCase() : null; // 'AM' or 'PM'
      const hour12 = Number((parts[0] || '').split(':')[0]) || new Date().getHours();

      if (period === 'AM') return 'Good morning';
      if (period === 'PM') {
        if (hour12 >= 6) return 'Good evening';
        return 'Good afternoon';
      }

      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Good morning';
      if (hour >= 12 && hour < 17) return 'Good afternoon';
      if (hour >= 17 && hour < 21) return 'Good evening';
      return 'Hello';
    } catch (e) {
      return 'Hello';
    }
  }, []);

  return (
    <header className="flex items-center justify-between gap-6">
      <div>
        <h1 className="text-5xl font-bold text-[#012d1d]">
          {greeting}, {displayName}!
        </h1>

        <p className="text-gray-500 text-lg mt-2">
          Your harvest dashboard is updated with latest AI insights.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm min-w-60">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#1f6d1a] text-lg font-bold text-white">
          {user?.farm_logo_url ? (
            <img
              src={user.farm_logo_url}
              alt={`${displayName} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{farmInitials || "NK"}</span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-bold text-[#012d1d]">
            {displayName}
          </h3>

          <p className="truncate text-gray-500 text-sm">
            {ownerName}
          </p>
        </div>
      </div>
    </header>
  );
};

export default FarmerHeader;