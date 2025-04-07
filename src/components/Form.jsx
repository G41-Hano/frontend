import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method, userType }) { /* route is for the route when submitting form, method identifies if its for register or login */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Dynamic text based on form type
    const name = method === "login" ? "Log in to your Account" : `${userType} Registration`;
    const btnName = method === "login" ? "Login Now" : "Register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (method !== "login" && password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
    
        const payload = method === "login"
            ? { username, password }
            : {
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                email,
                role: userType.toLowerCase()
            };
    
        try {
            console.log('Sending request to:', route);
            console.log('With payload:', { ...payload, password: '***' });
            
            const res = await api.post(route, payload);
            console.log('Response:', res.data);
    
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error('Full error:', error);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.message ||
                               error.message ||
                               'Registration failed. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };    

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="text-center mb-8">
                <h1 className="text-[20px] font-semibold text-[#4C53B4] mb-2">{name}</h1>
                <div className="w-20 h-1 bg-[#4C53B4] mx-auto rounded-full"></div>
            </div>

            {/* Registration Fields  */}
            {method !== "login" && (
                <div className="space-y-4">
                    {/* First Name */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-user text-xl"></i>
                            </span>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                required
                                className="input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-user text-xl"></i>
                            </span>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                required
                                className="input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-envelope text-xl"></i>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Username Field */}
            <div className="form-control w-full">
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                        <i className="fa-solid fa-circle-user text-xl"></i>
                    </span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className="input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="form-control w-full">
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                        <i className="fa-solid fa-lock text-xl"></i>
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
                    >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
                    </button>
                </div>
            </div>

            {/* Confirm Password Field */}
            {method !== "login" && (
                <div className="form-control w-full">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                            <i className="fa-solid fa-shield-halved text-xl"></i>
                        </span>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
                        >
                            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
                        </button>
                    </div>
                </div>
            )}

            {loading && <LoadingIndicator />}
            
            {/* Submit Button */}
            <button
                className="btn w-full rounded-3xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white border-none py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-3"
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-md"></span>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {btnName}
                    </div>
                )}
            </button>

            {/* Login/Register Link */}
            <div className="text-center mt-1">
                {method === "login" ? (
                    <p className="text-gray-600">
                        Don't have an account? {" "}
                        <a href="/register" className="text-[#4C53B4] hover:text-[#3a4095] font-semibold hover:underline transition-colors hover:scale-105 inline-block">
                            Register Now!
                        </a>
                    </p>
                ) : (
                    <p className="text-gray-600">
                        Already have an account? {" "}
                        <a href="/login" className="text-[#4C53B4] hover:text-[#3a4095] font-semibold hover:underline transition-colors hover:scale-105 inline-block">
                            Login Now!
                        </a>
                    </p>
                )}
            </div>
        </form>
    );
}

export default Form