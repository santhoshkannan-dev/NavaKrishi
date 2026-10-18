import { FiKey, FiShield, FiMonitor } from "react-icons/fi";
import { useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const SecuritySettings = () => {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleChangePassword = async () => {
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      const resp = await API.post("/auth/change-password/", {
        email: user.email,
        current_password: currentPassword,
        new_password: newPassword,
      });

      setMessage({ type: "success", text: resp.data.message });

      // clear tokens and force re-login
      logout();
    } catch (err) {
      const text = err?.response?.data?.error || "Failed to change password.";
      setMessage({ type: "error", text });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-5">

      <h2 className="text-4xl font-bold text-[#012d1d]">Security & Access</h2>

      <div className="border border-gray-200 rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="font-bold">Change Password</h3>
          <p className="text-gray-500 text-sm">Update your account password.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-2"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-2"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-2"
          />

          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(null); }} className="border px-4 py-2 rounded-2xl">Cancel</button>

            <button onClick={handleChangePassword} className="bg-[#1f6d1a] text-white px-4 py-2 rounded-2xl">Update</button>
          </div>

          {message && (
            <div className={`mt-3 p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FiShield />

          <div>
            <h3 className="font-bold">Two-Factor Authentication</h3>
            <p className="text-[#1f6d1a] text-sm">Currently Managed Externally</p>
          </div>
        </div>

        <input type="checkbox" checked readOnly />
      </div>

      <div className="border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FiMonitor />

          <div>
            <h3 className="font-bold">Connected Devices</h3>
            <p className="text-gray-500 text-sm">Manage active sessions in your account settings.</p>
          </div>
        </div>

        <button className="text-[#1f6d1a]">Manage All</button>
      </div>

      <button className="w-full border border-red-300 text-red-500 py-4 rounded-2xl mt-4">Deactivate Account</button>
    </div>
  );
};

export default SecuritySettings;