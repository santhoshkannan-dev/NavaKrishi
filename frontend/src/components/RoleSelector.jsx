const roles = [
  {
    name: "Customer",
    icon: "👤",
  },

  {
    name: "Farmer",
    icon: "🌾",
  },

  // {
  //   name: "Admin",
  //   icon: "⚙️",
  // },
];

const RoleSelector = ({
  selectedRole,
  setSelectedRole,
}) => {
  return (
    <div>
      
      <label className="text-gray-500 font-medium block mb-4">
        Select Your Role
      </label>

      <div className="grid grid-cols-3 gap-4">
        
        {roles.map((role) => (
          <button
            key={role.name}
            type="button"
            onClick={() => setSelectedRole(role.name)}
            className={`border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${
                  selectedRole === role.name
                    ? "bg-[#dff5d8] border-[#1f6d1a] ring-2 ring-[#1f6d1a]"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
          >
            <span className="text-2xl">
              {role.icon}
            </span>

            <span className="font-medium">
              {role.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;