"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/src/lib/firebase/client";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔥 Register using Email & Password
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Create a Firestore document in /accounts
      await setDoc(doc(db, "accounts", user.uid), {
        name,
        email,
        type: "doctor",
        createdAt: serverTimestamp(),
        // you can add more default fields if needed
        medicalLicenseNumber: "",
        specialty: "",
        yearsOfExperience: "",
        yearOfGraduation: "",
        medicalSchool: "",
        mobileNo: "",
        gender: "",
        dob: "",
        stateProvince: "",
        governmentId: "",
      });

      // 3️⃣ Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Google Sign Up
  async function handleGoogleSignup() {
    setErrorMsg("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if account already exists in /accounts
      await setDoc(doc(db, "accounts", user.uid), {
        name: user.displayName || "",
        email: user.email || "",
        type: "doctor",
        createdAt: serverTimestamp(),
      }, { merge: true }); // merge: true avoids overwriting if already exists

      router.push("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#dff5f5] flex items-center justify-center p-6">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-10">
        {/* LEFT PANEL */}
        <div className="left-panel-container w-5/12 p-12 text-white flex-col justify-center items-center hidden md:flex">
          <div className="left-panel-content flex flex-col justify-center items-center text-center">
            <img src="/images/careConnectLogo.png" alt="Care Connect Logo" className="w-[10.25rem] h-[10.25rem] mb-4 object-contain" />
            <p className="text-6xl font-extrabold text-white/60">Welcome</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-7/12 p-10 md:p-16 relative z-10 bg-white">
          <h2 className="text-3xl font-extrabold text-[#006A71] mb-6 text-center">Sign Up</h2>

          <form onSubmit={handleRegister}>
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Full Name"
                className="input-field"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg text-center font-medium bg-red-100 text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <button onClick={handleGoogleSignup} className="btn-google">
            <img src="/images/google-icon.png" alt="Google Icon" className="w-6 h-6" />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?
            <Link href="/" className="text-link"> Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
