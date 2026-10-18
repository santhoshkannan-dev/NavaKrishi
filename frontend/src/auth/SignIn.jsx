import { useState } from "react";
import AuthLeftPanel from "../components/AuthLeftPanel";
import SocialLogin from "../components/SocialLogin";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { toast } from "react-toastify";


const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await API.post(
        "/auth/login/",
        {
          email,
          password,
        }
      );

      const data = response.data;

      const accountRole = data.user?.role;

      if (role !== accountRole) {
        toast.error(
          `Selected role "${role}" does not match account role "${accountRole}". Please choose the correct role before signing in.`
        );
        return;
      }

      login(data.user, {
        token: data.token,
        refresh_token: data.refresh_token,
      });
      toast.success("Signed in successfully");

      if (accountRole === "farmer") {
        navigate("/farmer-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {})
          .flat()
          .join(" ") ||
        "Sign in failed. Check credentials and try again.";

      toast.error(msg);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      
      <AuthLeftPanel />

      {/* Right Side */}
      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-[#fbf9f8]">
        
        <div className="w-full max-w-md">

          {/* Mobile Header */}
          <div className="md:hidden text-center mb-12">
            <h1 className="text-4xl font-bold text-[#012d1d]">
              NavaKrishi
            </h1>

            <p className="text-[#1f6d1a] mt-2">
              Join our organic community
            </p>
          </div>

          <div className="mb-10">
            
            <h2 className="text-5xl font-bold text-[#012d1d]">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-4 text-lg">
              Please enter your details to continue.
            </p>
          </div>

          <div>
            <label className="text-gray-500 font-medium block mb-4">
              Select Your Role
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${
                  role === "customer"
                    ? "bg-[#dff5d8] border-[#1f6d1a] ring-2 ring-[#1f6d1a]"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">👤</span>
                <span className="font-medium">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("farmer")}
                className={`border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${
                  role === "farmer"
                    ? "bg-[#dff5d8] border-[#1f6d1a] ring-2 ring-[#1f6d1a]"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">🌾</span>
                <span className="font-medium">Farmer</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6 mt-10" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-gray-500 mb-3">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="farmer@greenvalley.com"
                className="w-full border border-gray-300 rounded-xl px-5 py-4 outline-none focus:border-[#1f6d1a]"
              />
            </div>

            <div>
              
              <div className="flex justify-between mb-3">
                
                <label className="text-gray-500">
                  Password
                </label>

                <button
                  type="button"
                  className="text-[#1f6d1a]"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-5 py-4 pr-12 outline-none focus:border-[#1f6d1a]"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.067.157-2.093.448-3.062M3.98 3.98L20.02 20.02M9.88 9.88A3 3 0 0114.12 14.12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              
              <input type="checkbox" />

              <p className="text-gray-500">
                Remember me for 30 days
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#012d1d] hover:bg-[#1f6d1a] text-white py-4 rounded-2xl font-semibold transition"
            >
              Sign In to Dashboard
            </button>
          </form>

          <SocialLogin />

          <p className="text-center mt-10 text-gray-500">
            Don't have an account?{" "}

            <Link
              to="/sign-up"
              className="text-[#1f6d1a] font-semibold"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default SignIn;