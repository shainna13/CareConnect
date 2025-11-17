
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    function handleRegister(e: React.FormEvent) {
      e.preventDefault();
      // TODO: implement register logic
      router.push('/dashboard');
    }
  
    return (
      <div className="min-h-screen bg-[#dff5f5] flex items-center justify-center p-6">
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

            {/* Sign Up Form */}
            <div id="signup-form">
              <h2 className="text-3xl font-extrabold text-[#006A71] mb-6 text-center">Sign Up</h2>

              <form id="signup-form-element">

                {/* Full Name */}
                <div className="mb-4 relative">
                  <label htmlFor="signup-name" className="sr-only">Full Name</label>
                  <input
                    type="text"
                    id="signup-name"
                    placeholder="Full Name"
                    className="input-field"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>

                {/* Email */}
                <div className="mb-4 relative">
                  <label htmlFor="signup-email" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="signup-email"
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
                  <label htmlFor="signup-password" className="sr-only">Password</label>
                  <input
                    type="password"
                    id="signup-password"
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
                    id="signup-toggle-password"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <svg id="signup-eye-icon" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <svg id="signup-eye-slash-icon" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden"
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

                <button type="submit" id="signup-button" className="btn-primary">Sign Up</button>
              </form>

              {/* OR Separator */}
              <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-gray-500 text-sm">or</span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>

              {/* Google Sign Up */}
              <button id="google-login-button-signup" className="btn-google">
                <img src="images/google-icon.png" alt="Google Icon" className="w-6 h-6" />
                Sign up with Google
              </button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-400 mt-8">
                Already have an account?
                <Link href="/" id="show-login-form" className="text-link">Login</Link>
              </p>
            </div>

            {/* Message/Error Box */}
            <div id="message-box" className="hidden mt-4 p-3 rounded-lg text-center font-medium"></div>

          </div>
          </div>
      </div>
    );
  }