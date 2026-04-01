// src/components/auth/LoginForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext';
import { useAdminAuth } from '../../admin/context/AdminAuthContext';
import { toast } from 'react-toastify';

import { API_BASE, loginUser } from '../../services/api';
import LoginImg2 from '../../assets/Loginimg2.png';

const LoginForm = () => {
  const [eMail, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: appLogin } = useContext(AuthContext);
  const adminContext = useAdminAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        if (parsed?.role === 'admin' || parsed?.isAdmin) navigate('/admin/dashboard');
        else navigate('/');
      } catch {
        // ignore parse errors
      }
    }
  }, [navigate]);

  const emailRegex = /\S+@\S+\.\S+/;
  const passRegex = /^.{6,}$/;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(emailRegex.test(e.target.value) ? '' : 'Invalid email format');
  };

  const handlePassChange = (e) => {
    setPass(e.target.value);
    setPassError(passRegex.test(e.target.value) ? '' : 'Password must be at least 6 characters');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError || passError) {
      toast.warning('Please fix the input errors');
      return;
    }
    if (!eMail || !pass) {
      toast.warning('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      // 1. Call the new login API (returns normalized data via handleRequest)
      const userObj = await loginUser(eMail, pass);
      console.log("loggrf in user credential:", userObj);
      // 2. Persist safely
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      if (appLogin) appLogin(userObj);
      if (adminContext?.login) adminContext.login(userObj);

      toast.success('Login successful!');

      // 3. Navigate based on role (checks both 'role' and 'Role')
      const userRole = userObj.role || userObj.Role;
      if (userRole === 'Admin' || userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      // The message now comes directly from your backend thanks to handleRequest!
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl mt-14 px-4">
      <div className="bg-emerald-300 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 hidden md:flex justify-center items-center overflow-hidden">
          <img src={LoginImg2} alt="Login" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 h-64 md:h-auto bg-white p-6 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">Login</h1>

          <form className="w-full max-w-xs space-y-4" onSubmit={handleSubmit}>
            <input
              className="border-2 rounded-md p-2 text-center w-full"
              type="email"
              placeholder="Email ID"
              value={eMail}
              onChange={handleEmailChange}
              autoComplete="email"
            />
            {emailError && <span className="text-red-500 text-sm">{emailError}</span>}

            <input
              className="border-2 rounded-md p-2 text-center w-full"
              type="password"
              placeholder="Password"
              value={pass}
              onChange={handlePassChange}
              autoComplete="current-password"
            />
            {passError && <span className="text-red-500 text-sm">{passError}</span>}

            <button
              type="submit"
              className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <p className="text-center mt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;