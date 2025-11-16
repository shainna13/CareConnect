
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Colors used to match the reference
// teal: #1f8f8b (used for buttons/accents), light teal background: #dff5f5

/* ---------- Shared UI pieces ---------- */
function IconUser() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

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
    <div className="min-h-screen bg-[#dff5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left curved teal panel (SVG) */}
        <div className="relative bg-teal-600 md:block hidden">
          <svg viewBox="0 0 600 800" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#57b6b2" />
                <stop offset="100%" stopColor="#1f8f8b" />
              </linearGradient>
            </defs>
            <path d="M0,0 L350,0 Q500,200 350,600 L0,600 Z" fill="url(#g1)" />
            <path d="M0,0 L300,0 Q460,160 300,560 L0,560 Z" fill="#9fe6e4" opacity="0.18" />
          </svg>

          <div className="relative h-full flex flex-col items-start justify-center p-12 text-white">
            {/* Placeholder for your logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                {/* small placeholder icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-xl">Care Connect</div>
                <div className="text-sm opacity-80">Healthcare Portal</div>
              </div>
            </div>

            <h2 className="text-6xl font-extrabold opacity-40">Welcome</h2>
          </div>
        </div>

        {/* Right form area */}
        <div className="p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-extrabold text-teal-800 mb-8 text-center">LOGIN</h1>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconUser />
                </div>
              </div>

              <div className="relative">
                <input
                  required
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconEye />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div />
                <Link href="#" className="text-sm text-orange-500">Forgot Password?</Link>
              </div>

              <button className="w-36 mx-auto block bg-teal-800 text-white py-3 rounded-full shadow-md hover:shadow-lg transition">
                Login
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="text-sm text-gray-400">or</div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button type="button" className="w-full border border-gray-200 rounded-lg py-3 flex items-center justify-center gap-3">
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm">Login with Google</span>
              </button>

              <p className="text-center text-sm text-gray-500">
                New to Care Connect? <Link href="/register" className="text-orange-500 underline">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
