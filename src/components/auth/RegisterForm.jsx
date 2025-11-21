import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

/* Environment-based backend URL */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const SignUp = () => {
    const [name, setName] = useState('');
    const [eMail, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passError, setPassError] = useState('');
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^.{6,}$/;

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError(emailRegex.test(e.target.value) ? '' : 'Invalid email format');
    };

    const handlePassChange = (e) => {
        setPass(e.target.value);
        setPassError(passRegex.test(e.target.value) ? '' : 'Password must be 6+ characters');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailError && !passError && name && eMail && pass) {
            const newUser = { name, email: eMail, password: pass };

            try {
                const response = await fetch(`${API_BASE}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser),
                });

                if (response.ok) {
                    toast.success("Registration successful!");
                    setName('');
                    setEmail('');
                    setPass('');
                    navigate('/login');
                } else {
                    toast.error("Failed to register user.");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("An error occurred during registration.");
            }
        } else {
            toast.warning("Please fix the input errors.");
        }
    };

    return (
        <div className="mx-auto max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl mt-14 px-4">
            <div className="bg-emerald-300 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                <div className="flex-1 h-64 md:h-auto bg-white p-6 flex flex-col justify-center items-center">
                    <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

                    <form className="w-full max-w-xs space-y-4" onSubmit={handleSubmit}>
                        <input
                            className="border-2 rounded-md p-2 text-center w-full"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            className="border-2 rounded-md p-2 text-center w-full"
                            type="text"
                            placeholder="Email ID"
                            value={eMail}
                            onChange={handleEmailChange}
                        />
                        {emailError && <span className="text-red-500 text-sm">{emailError}</span>}

                        <input
                            className="border-2 rounded-md p-2 text-center w-full"
                            type="password"
                            placeholder="Password"
                            value={pass}
                            onChange={handlePassChange}
                        />
                        {passError && <span className="text-red-500 text-sm">{passError}</span>}

                        <button
                            type="submit"
                            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2"
                        >
                            Sign Up
                        </button>
                    </form>
                </div>

                <div className="w-full md:w-1/2 hidden md:flex justify-center items-center overflow-hidden">
                    <img
                        src="/assets/Loginimg.png"
                        alt="Login"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default SignUp;