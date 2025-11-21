// src/components/auth/LoginForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext';
import { useAdminAuth } from '../../admin/context/AdminAuthContext';
import { toast } from 'react-toastify';

/* Environment-aware API base */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

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
      // Fetch users and check credentials
      const usersRes = await fetch(`${API_BASE}/users`);
      if (!usersRes.ok) throw new Error('Network issue while fetching users');
      const users = await usersRes.json();
      const foundUser = users.find(u => u.email === eMail && u.password === pass);

      if (foundUser) {
        if (foundUser.isBlock) {
          toast.error('Your account has been blocked. Contact the administrator.');
          setLoading(false);
          return; 
        }

        const userObj = { ...foundUser, role: foundUser.role || 'user' };
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        if (appLogin) appLogin(userObj);
        if (userObj.role === 'admin' && adminContext?.login) {
          adminContext.login(userObj);
          toast.success('Admin login successful');
          navigate('/admin/dashboard');
        } else {
          toast.success('Login successful!');
          navigate('/');
        }
        return;
      }

      // Check admins if normal user not found
      const adminsRes = await fetch(`${API_BASE}/admins`);
      if (!adminsRes.ok) throw new Error('Network issue while fetching admins');
      const admins = await adminsRes.json();
      const foundAdmin = admins.find(a => a.email === eMail && a.password === pass);

      if (foundAdmin) {
        if (foundAdmin.isBlock) {
          toast.error('This admin account has been blocked. Contact the super-admin.');
          setLoading(false);
          return;
        }

        const adminObj = { ...foundAdmin, role: foundAdmin.role || 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(adminObj));
        if (adminContext?.login) adminContext.login(adminObj);
        if (appLogin) appLogin(adminObj);
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
        return;
      }

      toast.error('Invalid email or password');
    } catch (err) {
      console.error('Error during login:', err);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl mt-14 px-4">
      <div className="bg-emerald-300 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 hidden md:flex justify-center items-center overflow-hidden">
         <img  src="/assets/Loginimg2.png" alt="Login" className="w-full h-full object-cover" />
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