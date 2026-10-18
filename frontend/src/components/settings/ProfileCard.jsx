import { useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import accountAPI from "../../api/account";
import showToast from "../../utils/toast";

const ProfileCard = () => {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePickAvatar = () => {
    inputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const updated = await accountAPI.updateProfile(formData);
      updateUser(updated);
      showToast("Avatar updated successfully.");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Unable to upload avatar.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">

      <div className="relative w-36 h-36 mx-auto">

        <img
          src={user?.avatar_url || user?.avatar || "https://i.pravatar.cc/300"}
          alt=""
          className="w-full h-full rounded-full object-cover border-4 border-[#a4f792]"
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <button
          type="button"
          onClick={handlePickAvatar}
          disabled={uploading}
          className="absolute bottom-2 right-2 bg-[#012d1d] text-white p-3 rounded-full disabled:opacity-60"
        >
          <FiCamera />
        </button>
      </div>

      <h3 className="text-4xl font-bold text-[#012d1d] mt-6">
        {user?.username || "Arjun Sharma"}
      </h3>

      <p className="text-gray-500 mt-2">
        {user?.email || "arjun@example.com"}
      </p>

      <div className="bg-[#dff5d8] text-[#267320] inline-flex items-center gap-2 px-4 py-2 rounded-full mt-6">
        {user?.role ? `✅ ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : "✅ Verified Farmer"}
      </div>
    </div>
  );
};

export default ProfileCard;