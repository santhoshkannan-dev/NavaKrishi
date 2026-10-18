import { useEffect, useState } from "react";
import { FiTruck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import API from "../../api/axios";
import { saveShippingAddress } from "../../utils/orderReceipt";

const emptyAddress = {
  label: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  phone: "",
};

const ShippingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(emptyAddress);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchDefaultAddress = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await API.get("/auth/addresses/");
        const addresses = Array.isArray(response.data) ? response.data : [];
        const defaultAddress = addresses.find((item) => item.is_default) || addresses[0] || null;

        if (!mounted) return;

        if (defaultAddress) {
          const nextAddress = {
            label: defaultAddress.label || "",
            address_line1: defaultAddress.address_line1 || defaultAddress.address || "",
            address_line2: defaultAddress.address_line2 || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            pincode: defaultAddress.pincode || "",
            country: defaultAddress.country || "India",
            phone: defaultAddress.phone || "",
          };

          setAddress(nextAddress);
          saveShippingAddress(nextAddress);
          setMessage(defaultAddress.is_default ? "Loaded your default saved address." : "Loaded your most recent saved address.");
        } else {
          setAddress(emptyAddress);
          saveShippingAddress(emptyAddress);
          setMessage("No saved shipping address found. Add one in your profile settings.");
        }
      } catch (error) {
        if (!mounted) return;
        if (error?.response?.status === 401) {
          navigate("/sign-in");
          return;
        }

        setMessage("Unable to load shipping address right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDefaultAddress();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleFieldChange = (field, value) => {
    setAddress((current) => {
      const nextAddress = {
        ...current,
        [field]: value,
      };

      saveShippingAddress(nextAddress);
      return nextAddress;
    });
  };

  const addressPreview = [
    address.address_line1,
    address.address_line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      
      <div className="flex items-center justify-between mb-8">
        
        <h2 className="text-3xl font-bold text-[#012d1d] flex items-center gap-3">
          <FiTruck />
          Shipping Address
        </h2>

        <Link
          to="/settings#shipping-addresses"
          className="text-[#1f6d1a] font-semibold"
        >
          Change
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-[#d7f2d2] bg-[#f5fff2] px-4 py-3 text-sm text-[#1f6d1a]">
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-20 rounded-2xl bg-gray-100 md:col-span-1" />
          <div className="h-20 rounded-2xl bg-gray-100 md:col-span-1" />
          <div className="h-28 rounded-2xl bg-gray-100 md:col-span-2" />
          <div className="h-20 rounded-2xl bg-gray-100 md:col-span-1" />
          <div className="h-20 rounded-2xl bg-gray-100 md:col-span-1" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-3 text-gray-500">
              Full Name
            </label>

            <input
              type="text"
              value={address.label}
              onChange={(event) => handleFieldChange("label", event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
            />
          </div>

          <div>
            <label className="block mb-3 text-gray-500">
              Phone Number
            </label>

            <input
              type="text"
              value={address.phone}
              onChange={(event) => handleFieldChange("phone", event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
            />
          </div>

          <div className="md:col-span-2">
            
            <label className="block mb-3 text-gray-500">
              Street Address
            </label>

            <textarea
              rows="3"
              value={addressPreview}
              onChange={(event) => handleFieldChange("address_line1", event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
            />
          </div>

          <div>
            <label className="block mb-3 text-gray-500">
              City
            </label>

            <input
              type="text"
              value={address.city}
              onChange={(event) => handleFieldChange("city", event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
            />
          </div>

          <div>
            <label className="block mb-3 text-gray-500">
              PIN Code
            </label>

            <input
              type="text"
              value={address.pincode}
              onChange={(event) => handleFieldChange("pincode", event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ShippingForm;