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
        <div className="relative hidden w-[610px] p-12 text-white flex-col justify-center items-center hidden md:flex">
        <svg
            width="502px"
            height="808"
            viewBox="0 0 598 808"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute" }}
            className="absolute right-[-6px] top-[-115px] "
          >
            <path
              d="M119.924 0C300.248 196.077 529.249 466.385 568.5 613.5C588.58 688.76 596.496 753.839 597.775 808H0V0H119.924Z"
              fill="#48A6A7"
            />
          </svg>

          <svg
            width="460px"
            height="808"
            viewBox="0 0 574 808"
            fill="none"
            className="absolute right-[13px] top-[-110px]"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute" }}
          >
            <path
              d="M338.245 0C426.613 212.544 532.265 477.688 568.5 613.5C588.607 688.862 540.369 753.923 463.391 808H0V0H338.245Z"
              fill="#48A6A7"
              fillOpacity="0.5"
            />
          </svg>

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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 10.884l7.997-5A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.116l-8 5-8-5V14a2 2 0 002 2h12a2 2 0 002-2V8.116z" />
                </svg>
              </span>

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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
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
