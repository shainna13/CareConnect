"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/app/src/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Email + Password Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔐 Google Login
  async function handleGoogleLogin() {
    setErrorMsg("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="bg-[#CCE5E7] flex items-center justify-center min-h-screen">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-10">
        
        {/* LEFT PANEL */}
        <div className="left-panel-container w-5/12 p-12 text-white flex-col justify-center items-center hidden md:flex">
          <div className="left-panel-content flex flex-col justify-center items-center text-center">
            <img
              src="/images/careConnectLogo.png"
              alt="Care Connect Logo"
              className="w-[10.25rem] h-[10.25rem] mb-4 object-contain"
            />
            <p className="text-6xl font-extrabold text-white/60">Welcome</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-7/12 p-10 md:p-16 relative z-10 bg-white">

          {/* LOGIN FORM */}
          <h2 className="text-3xl font-extrabold text-[#006A71] mb-6 text-center">
            LOGIN
          </h2>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="mb-4 relative">
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-3 text-red-600 bg-red-100 p-2 rounded">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* OR Separator */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
            className="btn-google"
          >
            <img src="/images/google-icon.png" alt="Google Icon" className="w-6 h-6" />
            Login with Google
          </button>

          {/* SIGNUP LINK */}
          <p className="text-center text-sm text-gray-400 mt-8">
            New to Care Connect?
            <Link href="/register" className="text-link"> Sign Up</Link>
          </p>

        </div>

      </div>
    </div>
  );
}
