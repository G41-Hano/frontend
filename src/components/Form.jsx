import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method, userType }) { /* route is for the route when submitting form, method identifies if its for register or login */
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: ""
    });
    const [errors, setErrors] = useState({}); 
    const [loading, setLoading] = useState(false);  
    const [showPassword, setShowPassword] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null }); 

    const name = method === "login" ? "Log in to your Account" : `${userType} Registration`;
    const btnName = method === "login" ? "Login Now" : "Register";

    // Check username availability when username changes
    useEffect(() => {
        const checkUsername = async () => {
            /* Skip check if:
            * 1. This is a login form (no need to check availability)
            * 2. Username is empty
            * 3. Username is too short (less than 4 chars)
            */
            if (method === "login" || !formData.username || formData.username.length < 4) {
                setUsernameStatus({ checking: false, available: null });
                setErrors(prev => ({ ...prev, username: "" }));
                return;
            }

            setUsernameStatus({ checking: true, available: null }); // Set status to checking before API call

            try {
                const response = await api.post(`/api/user/check-username/`, { username: formData.username });
                console.log('Username check response:', response); // Temporary debug log
                
                // If response indicates username exists
                if (response.data.exists || response.data.message === "Username already exists") {
                    setUsernameStatus({ checking: false, available: false });
                    setErrors(prev => ({ ...prev, username: "This username is already taken" }));
                } else {
                    setUsernameStatus({ checking: false, available: true });
                    setErrors(prev => ({ ...prev, username: "" }));
                }
            } catch (error) {
                console.log('Username check error:', error.response); // Temporary debug log
                
                // If error response indicates username exists
                if (error.response?.data?.exists || 
                    error.response?.data?.message === "Username already exists" ||
                    error.response?.status === 400) {
                    setUsernameStatus({ checking: false, available: false });
                    setErrors(prev => ({ ...prev, username: "This username is already taken" }));
                } else {
                    // If error doesn't indicate username exists, consider it available
                    setUsernameStatus({ checking: false, available: true });
                    setErrors(prev => ({ ...prev, username: "" }));
                }
            }
        };

        const timeoutId = setTimeout(checkUsername, 300);   // Wait 300ms after last username change before checking
        return () => clearTimeout(timeoutId);               // Cleanup function to clear timeout if username changes again
    }, [formData.username, method]);


    const validateForm = () => {
        const newErrors = {};
        
        // Username validation - min 4 chars
        if (!formData.username) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 4) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Password validation - min 8 chars
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (method !== "login" && formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        // Additional validations for registration only
        if (method !== "login") {
            // First Name validation
            if (!formData.firstName) {
                newErrors.firstName = "First name is required";
            }

            // Last Name validation
            if (!formData.lastName) {
                newErrors.lastName = "Last name is required";
            }

            // Email validation
            if (!formData.email) {
                newErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }

            // Confirm Password validation - must match password
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Please confirm your password";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle input changes and clear errors
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Only clear errors for non-username fields
        if (name !== "username" && errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        // Check username availability for registration
        if (method !== "login" && !usernameStatus.available) {
            setErrors(prev => ({
                ...prev,
                username: "This username is already taken"
            }));
            return;
        }

        setLoading(true);
    
        // Prepare payload based on form type
        const payload = method === "login"
            ? { 
                username: formData.username, 
                password: formData.password 
            }
            : {
                username: formData.username,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                role_input: userType.toLowerCase(),
            };
    
        try {
            const res = await api.post(route, payload);
    
            // Handle successful login - store tokens and redirect
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                // Redirect to login after successful registration
                navigate("/login");
            }
        } catch (error) {
            let errorMessage;
            // Handle login errors
            if (method === "login") {
                if (error.response?.data?.detail === "No active account found with the given credentials") {
                    errorMessage = "Incorrect username or password";
                } else {
                    errorMessage = error.response?.data?.detail || 
                                 error.response?.data?.message ||
                                 error.message ||
                                 'Login failed. Please try again.';
                }
            } else {
                // Handle registration errors
                if (error.response?.status === 400) {
                    if (error.response?.data?.username) {
                        setErrors(prev => ({
                            ...prev,
                            username: "This username is already taken"
                        }));
                        return;
                    }
                    errorMessage = error.response?.data?.detail || 
                                 error.response?.data?.message ||
                                 'Registration failed. Please check your input.';
                } else {
                    errorMessage = error.response?.data?.detail || 
                                 error.response?.data?.message ||
                                 error.message ||
                                 'Registration failed. Please try again.';
                }
            }
            setErrors(prev => ({
                ...prev,
                submit: errorMessage
            }));
        } finally {
            setLoading(false);
        }
    };    

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            {/* Form Header */}
            <div className="text-center mb-8">
                <h1 className="text-[20px] font-semibold text-[#4C53B4] mb-2">{name}</h1>
                <div className="w-20 h-1 bg-[#4C53B4] mx-auto rounded-full"></div>
            </div>

            {/* Display general form errors */}
            {errors.submit && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errors.submit}</span>
                </div>
            )}

            {/* Registration Fields - Only shown for registration */}
            {method !== "login" && (
                <div className="space-y-4">
                    {/* First Name Field */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-user text-xl"></i>
                            </span>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className={`input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                            />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Last Name Field */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-user text-xl"></i>
                            </span>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                className={`input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                            />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>

                    {/* Email Field */}
                    <div className="form-control w-full">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                                <i className="fa-solid fa-envelope text-xl"></i>
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={`input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                </div>
            )}

            {/* Username Field - Shown for both login and registration */}
            <div className="form-control w-full">
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                        <i className="fa-solid fa-circle-user text-xl"></i>
                    </span>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        className={`input w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 border-2 ${
                            errors.username ? 'border-red-500' : 
                            usernameStatus.available === true ? 'border-green-500' :
                            usernameStatus.available === false ? 'border-red-500' :
                            'border-gray-200'
                        } focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                    />
                    {/* Username availability indicator - Only shown for registration */}
                    {method !== "login" && formData.username && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2">
                            {usernameStatus.checking ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4C53B4] rounded-full animate-spin"></div>
                            ) : usernameStatus.available === true ? (
                                <i className="fa-solid fa-check text-green-500"></i>
                            ) : usernameStatus.available === false ? (
                                <i className="fa-solid fa-xmark text-red-500"></i>
                            ) : null}
                        </span>
                    )}
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                {/* Username availability message - Only shown for registration */}
                {method !== "login" && formData.username && !errors.username && (
                    <p className={`text-sm mt-1 ${
                        usernameStatus.available === true ? 'text-green-500' :
                        usernameStatus.available === false ? 'text-red-500' :
                        'text-gray-500'
                    }`}>
                        {usernameStatus.checking ? 'Checking availability...' :
                         usernameStatus.available === true ? 'Username is available' :
                         usernameStatus.available === false ? 'Username is taken' :
                         ''}
                    </p>
                )}
            </div>

            {/* Password Field - Shown for both login and registration */}
            <div className="form-control w-full">
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                        <i className="fa-solid fa-lock text-xl"></i>
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className={`input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                    />
                    {/* Toggle password visibility */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
                    >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field - Only shown for registration */}
            {method !== "login" && (
                <div className="form-control w-full">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                            <i className="fa-solid fa-shield-halved text-xl"></i>
                        </span>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className={`input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
                        />
                        {/* Toggle confirm password visibility */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
                        >
                            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
            )}

            {/* Loading indicator shown during form submission */}
            {loading && <LoadingIndicator />}
            
            {/* Submit Button with loading state */}
            <button
                type="submit"
                className="btn w-full rounded-3xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white border-none py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-3"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {btnName}
                    </div>
                )}
            </button>

            {/* Login/Register Link - Toggle based on form type */}
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