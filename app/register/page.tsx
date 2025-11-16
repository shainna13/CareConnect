
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
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* left panel reused */}
          <div className="relative bg-teal-600 md:block hidden">
            <svg viewBox="0 0 600 800" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#57b6b2" />
                  <stop offset="100%" stopColor="#1f8f8b" />
                </linearGradient>
              </defs>
              <path d="M0,0 L350,0 Q500,200 350,600 L0,600 Z" fill="url(#g2)" />
              <path d="M0,0 L300,0 Q460,160 300,560 L0,560 Z" fill="#9fe6e4" opacity="0.18" />
            </svg>
  
            <div className="relative h-full flex flex-col items-start justify-center p-12 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl">Care Connect</div>
                  <div className="text-sm opacity-80">Start your account</div>
                </div>
              </div>
  
              <h2 className="text-6xl font-extrabold opacity-40">Welcome</h2>
            </div>
          </div>
  
          <div className="p-10 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-extrabold text-teal-800 mb-8 text-center">Create Account</h1>
  
              <form onSubmit={handleRegister} className="space-y-4">
                <input className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
  
                <button className="w-full bg-teal-800 text-white py-3 rounded-full">Create account</button>
  
                <p className="text-center text-sm text-gray-500">Already have an account? <Link href="/" className="text-orange-500 underline">Login</Link></p>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }