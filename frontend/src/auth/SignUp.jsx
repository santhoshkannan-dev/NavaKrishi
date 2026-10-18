import { useState } from "react";
import AuthLeftPanel from "../components/AuthLeftPanel";
import RoleSelector from "../components/RoleSelector";
import SocialLogin from "../components/SocialLogin";
import TermsAndPrivacyModal from "../components/auth/TermsAndPrivacyModal";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Customer");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const roleKey = selectedRole.toLowerCase();
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openTerms = () => {
    setShowTermsModal(true);
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please read and accept the terms and conditions.");
      return;
    }

    try {
      await API.post("/auth/register/", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole.toLowerCase(),
        accepted_terms: true,
        accepted_terms_role: selectedRole.toLowerCase(),
        accepted_terms_version: "2026-05",
      });

      toast.success("Account created successfully");
      try {
        const loginResp = await API.post("/auth/login/", {
          email: formData.email,
          password: formData.password,
        });

        login(loginResp.data.user, {
          token: loginResp.data.token,
          refresh_token: loginResp.data.refresh_token,
        });

        const role = loginResp.data.user?.role;

        if (role === "farmer") {
          navigate("/farmer-dashboard");
        } else {
          navigate("/");
        }
      } catch (loginErr) {
        console.error("Auto-login failed", loginErr);
        toast.info("Account created — please sign in.");
        navigate("/");
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {})
          .flat()
          .join(" ");

      setErrorMessage(
        backendMessage || "Signup failed. Check the entered details and try again."
      );
      toast.error(
        backendMessage || "Signup failed. Check the entered details and try again."
      );
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <AuthLeftPanel />

      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-[#fbf9f8]">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-12">
            <h1 className="text-4xl font-bold text-[#012d1d]">NavaKrishi</h1>
            <p className="text-[#1f6d1a] mt-2">Join our organic community</p>
          </div>

          <div className="mb-10">
            <h2 className="text-5xl font-bold text-[#012d1d]">Create Account</h2>
            <p className="text-gray-500 mt-4 text-lg">Start your smart organic farming journey.</p>
          </div>

          <RoleSelector
            selectedRole={selectedRole}
            setSelectedRole={(value) => {
              setSelectedRole(value);
              setTermsAccepted(false);
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-6 mt-10">
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label className="block text-gray-500 mb-3">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Santhosh" className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]" />
            </div>

            <div>
              <label className="block text-gray-500 mb-3">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Kannan" className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]" />
            </div>

            <div>
              <label className="block text-gray-500 mb-3">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="santhoshkannan" className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]" />
            </div>

            <div>
              <label className="block text-gray-500 mb-3">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]" />
            </div>

            <div>
              <label className="block text-gray-500 mb-3">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-5 py-4 pr-14 outline-none focus:border-[#1f6d1a]" />
                <button type="button" onClick={() => setShowPassword((previous) => !previous)} className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#1f6d1a]" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-3">Confirm Password</label>
              <div className="relative">
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                readOnly
                onClick={(event) => {
                  event.preventDefault();
                  openTerms();
                }}
                className="mt-1 cursor-pointer"
              />

              <p className="text-gray-500 leading-relaxed">
                I agree to the{" "}
                <button type="button" onClick={openTerms} className="font-semibold text-[#1f6d1a] underline">
                  {roleKey === "farmer" ? "Farmer Terms & Conditions" : "Customer Terms & Conditions"}
                </button>{" "}
                and Privacy Policy.
              </p>
            </div>

            <button type="submit" disabled={!termsAccepted} className="w-full bg-[#012d1d] hover:bg-[#1f6d1a] text-white py-4 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:bg-gray-300">
              Create Account
            </button>
          </form>

          <TermsAndPrivacyModal
            open={showTermsModal}
            roleKey={roleKey}
            onClose={() => setShowTermsModal(false)}
            onAccept={acceptTerms}
          />

          <SocialLogin />

          <p className="text-center mt-10 text-gray-500">
            Already have an account?{" "}
            <Link to="/" className="text-[#1f6d1a] font-semibold">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default SignUp;