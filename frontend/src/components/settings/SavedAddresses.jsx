import { FiEdit, FiHome, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const emptyAddressForm = {
  label: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  phone: "",
  is_default: false,
};

const buildCombinedAddress = (form) =>
  [
    form.address_line1,
    form.address_line2,
    [form.city, form.state].filter(Boolean).join(", "),
    form.pincode,
    form.country,
  ]
    .filter(Boolean)
    .join("\n");

const SavedAddresses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddressForm);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const resp = await API.get("/auth/addresses/");
        setAddresses(resp.data);
        setForm((current) => ({
          ...current,
          is_default: resp.data.length === 0,
        }));
      } catch (error) {
        if (error?.response?.status === 401) {
          logout();
          navigate("/sign-in");
          return;
        }

        setAddresses([]);
      }
    };

    fetchAddresses();
  }, [navigate, logout, user]);

  const handleAdd = () => {
    setForm({ ...emptyAddressForm, is_default: addresses.length === 0 });
    setEditing({ isNew: true });
  };

  const handleEdit = (idx) => {
    const addr = addresses[idx];
    setForm({
      label: addr?.label ?? "",
      address_line1: addr?.address_line1 ?? addr?.address ?? "",
      address_line2: addr?.address_line2 ?? "",
      city: addr?.city ?? "",
      state: addr?.state ?? "",
      pincode: addr?.pincode ?? "",
      country: addr?.country ?? "India",
      phone: addr?.phone ?? "",
      is_default: !!addr?.is_default,
    });
    setEditing({ idx });
  };

  const handleDelete = async (idx) => {
    const addr = addresses[idx];

    if (!addr?.id) return;

    await API.delete(`/auth/addresses/${addr.id}/`);
    const resp = await API.get("/auth/addresses/");
    setAddresses(resp.data);
  };

  const handleSetDefault = async (idx) => {
    const addr = addresses[idx];

    if (!addr?.id) return;

    await API.put(`/auth/addresses/${addr.id}/`, { is_default: true });
    const resp = await API.get("/auth/addresses/");
    setAddresses(resp.data);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      address: buildCombinedAddress(form),
    };

    if (editing?.isNew) {
      await API.post("/auth/addresses/", payload);
    } else if (editing?.idx !== undefined) {
      const addr = addresses[editing.idx];
      if (addr?.id) {
        await API.put(`/auth/addresses/${addr.id}/`, payload);
      }
    }

    const resp = await API.get("/auth/addresses/");
    setAddresses(resp.data);
    setEditing(null);
    setForm(emptyAddressForm);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
        <div>
          <h2 className="text-4xl font-bold text-[#012d1d]">Saved Addresses</h2>
          <p className="text-gray-500 mt-2">Manage your shipping and warehouse locations</p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="bg-[#1f6d1a] hover:bg-[#165412] text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition font-semibold"
        >
          <FiPlus />
          Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:col-span-2">
          {addresses.length === 0 ? (
            <div className="lg:col-span-2 border border-dashed border-gray-300 rounded-3xl p-8 text-center text-gray-500">
              No saved addresses yet. Add one to get started.
            </div>
          ) : (
            addresses.map((addr, idx) => (
              <div
                key={addr.id}
                className={`rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                  addr.is_default
                    ? "border-2 border-[#1f6d1a] bg-[#f8fff7]"
                    : "border-gray-200 hover:border-[#1f6d1a]"
                }`}
              >
                {addr.is_default && (
                  <div className="flex justify-end mb-4">
                    <span className="bg-[#1f6d1a] text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
                      Default
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FiHome className="mt-1 text-[#1f6d1a] shrink-0" />

                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-[#012d1d]">{addr.label || "Saved Address"}</h3>

                    <div className="mt-4 space-y-2 text-gray-600 leading-relaxed">
                      {(addr.address_line1 || addr.address) && <p>{addr.address_line1 || addr.address}</p>}
                      {addr.address_line2 && <p>{addr.address_line2}</p>}
                      {(addr.city || addr.state) && <p>{[addr.city, addr.state].filter(Boolean).join(", ")}</p>}
                      {addr.pincode && <p>{addr.pincode}</p>}
                      {addr.country && <p>{addr.country}</p>}
                      {addr.phone && <p>{addr.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-5 mt-8 text-sm">
                  <button
                    type="button"
                    onClick={() => handleEdit(idx)}
                    className="text-[#1f6d1a] hover:underline font-semibold inline-flex items-center gap-2"
                  >
                    <FiEdit />
                    Edit
                  </button>

                  <div className="w-px h-4 bg-gray-300" />

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="text-[#1f6d1a] hover:underline font-semibold inline-flex items-center gap-2"
                  >
                    <FiTrash2 />
                    Remove
                  </button>

                  {!addr.is_default && (
                    <>
                      <div className="w-px h-4 bg-gray-300" />

                      <button
                        type="button"
                        onClick={() => handleSetDefault(idx)}
                        className="text-[#1f6d1a] hover:underline font-semibold"
                      >
                        Set as Default
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="border-2 border-dashed border-gray-300 hover:border-[#1f6d1a] rounded-3xl flex flex-col items-center justify-center min-h-80 transition-all group"
          >
            <FiPlus className="text-6xl text-gray-400 group-hover:text-[#1f6d1a]" />
            <p className="mt-4 text-gray-500 group-hover:text-[#1f6d1a] font-semibold">Add New Address</p>
          </button>
        </div>

        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
            onClick={() => setEditing(null)}
          >
            <div
              className="w-full max-w-4xl overflow-y-auto max-h-[90vh] rounded-4xl bg-white p-6 md:p-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#012d1d]">
                    {editing.isNew ? "Add New Address" : "Edit Address"}
                  </h3>
                  <p className="text-gray-500 mt-1">Fill in each address field separately.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-sm font-semibold text-gray-500 hover:text-[#012d1d]"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Full Name</label>
                  <input
                    placeholder="Arjun Sharma"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Phone Number</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">Address Line 1</label>
                  <input
                    placeholder="123 Green Valley Road"
                    value={form.address_line1}
                    onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">Address Line 2</label>
                  <input
                    placeholder="Sector 4, Near High School"
                    value={form.address_line2}
                    onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">City</label>
                  <input
                    placeholder="Shimla"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">State</label>
                  <input
                    placeholder="Himachal Pradesh"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Pincode</label>
                  <input
                    placeholder="171001"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Country</label>
                  <input
                    placeholder="India"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]/20 focus:border-[#1f6d1a]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-4 py-3">
                  <label className="flex items-center gap-3 text-sm text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#1f6d1a] focus:ring-[#1f6d1a]"
                    />
                    Set as default address
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="border border-gray-300 px-5 py-3 rounded-2xl font-semibold text-gray-700 hover:border-[#1f6d1a] hover:text-[#1f6d1a]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-[#1f6d1a] hover:bg-[#165412] text-white px-5 py-3 rounded-2xl font-semibold"
                  >
                    Save address
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAddresses;