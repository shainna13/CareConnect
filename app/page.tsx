
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/* ---------- Login Page (app/login/page.tsx) ---------- */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // TODO: replace with real auth
    router.push('/dashboard');
  }

  return (
    <div className='bg-[#CCE5E7] flex items-center justify-center min-h-screen'>
    <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-10">

    {/* LEFT PANEL */}
    <div className="left-panel-container w-5/12 p-12 text-white flex-col justify-center items-center hidden md:flex">
      <div className="left-panel-content flex flex-col justify-center items-center text-center">
        <img
          src="images/careConnectLogo.png"
          alt="Care Connect Logo"
          className="w-[10.25rem] h-[10.25rem] mb-4 object-contain"
        />
        <p className="text-6xl font-extrabold text-white/60">Welcome</p>
      </div>
    </div>
  
    {/* RIGHT PANEL */}
    <div className="w-full md:w-7/12 p-10 md:p-16 relative z-10 bg-white">
  
      {/* Login Form */}
      <div id="login-form">
        <h2 className="text-3xl font-extrabold text-[#006A71] mb-6 text-center">
          LOGIN
        </h2>
  
        <form id="login-form-element" onSubmit={handleLogin}>
  
          {/* Email */}
          <div className="mb-4 relative">
            <label htmlFor="login-email" className="sr-only">Email</label>
            <input
              type="email"
              id="login-email"
              placeholder="Email"
              className="input-field"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 10.884l7.997-5A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.116l-8 5-8-5V14a2 2 0 002 2h12a2 2 0 002-2V8.116z" />
              </svg>
            </span>
          </div>
  
          {/* Password */}
          <div className="mb-4 relative">
            <label htmlFor="login-password" className="sr-only">Password</label>
            <input
              type="password"
              id="login-password"
              placeholder="Password"
              className="input-field"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
  
            <button
              type="button"
              id="login-toggle-password"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {/* Eye icon */}
              <svg id="login-eye-icon" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
  
              {/* Eye slash icon */}
              <svg id="login-eye-slash-icon" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden"
                viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A9.935 9.935 0 0010 3C5.522 3 1.732 5.943.458 10a12.721 12.721 0 003.118 4.719L3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
                <path d="M10 17a9.95 9.95 0 01-5.718-1.71L1.39 12.4a1 1 0 010-1.414l.038-.038A9.98 9.98 0 0110 3a9.98 9.98 0 018.53 5.828l.038.038a1 1 0 010 1.414l-2.89 2.89A9.95 9.95 0 0110 17z" />
              </svg>
            </button>
          </div>
  
          <a href="#" className="text-link block text-right mb-4 text-sm">
            Forgot Password?
          </a>
  
          <button type="submit" id="login-button" className="btn-primary">
            Login
          </button>
        </form>
  
        {/* OR Separator */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-4 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
  
        {/* Google Login */}
        <button id="google-login-button" className="btn-google">
          <img src="images/google-icon.png" alt="Google Icon" className="w-6 h-6" />
          Login with Google
        </button>
  
        {/* Link to Sign Up */}
        <p className="text-center text-sm text-gray-400 mt-8">
          New to Care Connect?
          <Link href="/register" id="show-signup-form" className="text-link">Sign Up</Link>
        </p>
      </div>
    </div>
  </div>
  </div>
  );
}
