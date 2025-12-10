'use client';

import React, { useEffect, useState } from "react";
import { db } from "@/app/src/lib/firebase/client";
import { doc } from "firebase/firestore";
import { useUser } from "@/app/src/lib/context/UserContext";
import { updateAccount } from "@/app/src/service/account";


export default function ProfilePage() {
  const { accountData, currentUser, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>({
    photo: null,
    fullName: "",
    specialization: "",
    license: "",
    experience: "",
    bio: "",
    clinicName: "",
    contactNumber: "",
    email: "",
    location: "",
  });

  // Populate form when accountData is loaded
  useEffect(() => {
    if (accountData) {
      setProfile({
        photo: accountData.photo || null,
        fullName: accountData.name || "",
        specialization: accountData.specialty || "",
        license: accountData.medicalLicenseNumber || "",
        experience: accountData.yearsOfExperience || "",
        bio: accountData.bio || "",
        clinicName: accountData.clinicName || "",
        contactNumber: accountData.mobileNo || "",
        email: accountData.email || "",
        location: accountData.location || "",
      });
    }
  }, [accountData]);

  if (loading) return <p className="p-8">Loading profile...</p>;

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };
const handlePhotoUpload = async (e: any) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    console.log("Reading and compressing image...");
    console.log("Original size:", file.size, "bytes");

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const imgElement = new Image();
      imgElement.src = readerEvent.target?.result as string;

      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;

        let width = imgElement.width;
        let height = imgElement.height;

        // Maintain aspect ratio while resizing
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(imgElement, 0, 0, width, height);

        // Convert resized image to compressed JPEG Base64
        const compressedBase64 = canvas.toDataURL("data:image/jpeg;base64", 0.8);

        console.log("Compressed size:", compressedBase64.length, "bytes");

        // Update preview only (Firestore update happens in saveProfile)
        setProfile((prev: any) => ({
          ...prev,
          photo: compressedBase64,
        }));

        console.log("Image ready for Firestore (via saveProfile)");
      };
    };

    // Start reading the original file
    reader.readAsDataURL(file);

  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload image.");
  }
};

  const saveProfile = async () => {
    if (!accountData) return;
    
    try {
      await updateAccount(accountData.id, {
        name: profile.fullName,
        specialty: profile.specialization,
        medicalLicenseNumber: profile.license,
        yearsOfExperience: profile.experience,
        bio: profile.bio,
        clinicName: profile.clinicName,
        mobileNo: profile.contactNumber,
        email: profile.email,
        location: profile.location,
        photo: profile.photo,
      });
  
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Error updating profile.");
    }
  };
  
  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 ml-0 transition-all duration-300">
      <h1 className="text-3xl font-bold text-[#006A71] mb-6">Profile</h1>

      <div className="space-y-8">
        {/* Personal Info Card */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personal Info</h2>

            {/* Photo Upload */}
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden"
              >
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                ) : (                  <span>Photo</span>
                )}
              </div>

              <input
                type="file"
                id="profile-image-upload"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <label
                htmlFor="profile-image-upload"
                className="text-sm font-medium text-[#006A71] hover:underline cursor-pointer"
              >
                Upload from device
              </label>
            </div>

            {/* Inputs */}
            <InputField label="Full Name" name="fullName" value={profile.fullName} onChange={handleInput} />
            <InputField label="Specialization" name="specialization" value={profile.specialization} onChange={handleInput} />
            <InputField label="License Number" name="license" value={profile.license} onChange={handleInput} />
            <InputField label="Years of Experience" name="experience" value={profile.experience} onChange={handleInput} />
            <div>
              <p className="font-semibold text-gray-700 mb-1">Short Bio</p>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInput}
                rows={4}
                className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none"
              />
            </div>

            <div className="text-right">
              <button onClick={saveProfile} className="btn-save">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Contact Info</h2>
          <InputField label="Clinic / Hospital Name" name="clinicName" value={profile.clinicName} onChange={handleInput} />
          <InputField label="Contact Number" name="contactNumber" value={profile.contactNumber} onChange={handleInput} />
          <InputField label="Email Address" name="email" value={profile.email} onChange={handleInput} />
          <InputField label="Location" name="location" value={profile.location} onChange={handleInput} />

          <div className="text-right">
            <button onClick={saveProfile} className="btn-save">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input Component ---------- */
function InputField({ label, name, value, onChange }: any) {
  return (
    <div>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none"
      />
    </div>
  );
}
