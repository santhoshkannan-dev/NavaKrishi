import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const PersonalInfo = () => {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const API = (await import("../../api/axios")).default;
      const resp = await API.put("/auth/profile/", {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        // bio not supported on server yet
      });

      setMessage({ type: 'success', text: 'Profile updated' });
      // update local auth user
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, ...resp.data };
      localStorage.setItem('user', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">

      <h2 className="text-5xl font-bold text-[#012d1d] mb-10">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-3 text-gray-500">First Name</label>

          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-5 py-4"
          />
        </div>

        <div>
          <label className="block mb-3 text-gray-500">Last Name</label>

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-5 py-4"
          />
        </div>

        <div>
          <label className="block mb-3 text-gray-500">Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-5 py-4"
          />
        </div>

        <div>
          <label className="block mb-3 text-gray-500">Email Address</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-5 py-4"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-3 text-gray-500">Bio / Farm Description</label>

          <textarea
            rows="5"
            className="w-full border border-gray-300 rounded-2xl px-5 py-4"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">

        <button className="border border-[#1f6d1a] text-[#1f6d1a] px-8 py-4 rounded-2xl">
          Cancel
        </button>

        <button onClick={handleSaveProfile} disabled={saving} className="bg-[#1f6d1a] text-white px-8 py-4 rounded-2xl">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;