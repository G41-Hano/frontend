import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) { /* route is for the route when submitting form, method identifies if its for register or login */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [roleInput, setRoleInput] = useState("student"); // or "teacher" 
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register"; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const payload = method === "login"
            ? { username, password }
            : {
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                email,
                role_input: roleInput,
            };
    
        try {
            const res = await api.post(route, payload);
    
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.log(`${method} error:`, error.response?.data);
            alert(`${method === "login" ? "Login" : "Registration"} failed.`);
        } finally {
            setLoading(false);
        }
    };    

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />

            {/* Only show these if we're registering */}
            {method !== "login" && (
                <>
                    <input
                        className="form-input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                    />
                    <input
                        className="form-input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                    />
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <select
                        className="form-input"
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                    >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                </>
            )}
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
        </form>
    );
}

export default Form