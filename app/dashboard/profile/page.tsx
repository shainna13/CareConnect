'use client';

import React, { useState } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<any>({
    photo: null,
    fullName: "",
    specialization: "",
    license: "",
    experience: "",
    bio: "",
  });

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev: any) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
    }
  };

  const saveProfile = () => setIsEditing(false);

  return (
    <div className="w-full h-full bg-[#e1eff1] flex overflow-auto">
      {/* CONTENT BOX */}
      <div className="w-4/5 h-full mx-auto my-10 bg-white rounded-xl shadow p-10">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Create Profile" : "Profile"}
        </h1>
        <p className="text-lg text-gray-600 mt-1">Personal Info</p>

        {/* ==========================
              EDIT MODE
        ========================== */}
        {isEditing && (
          <div className="mt-8 space-y-6">
            {/* 1. Profile Photo */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">1. Profile Photo</p>
              <div className="flex items-center space-x-6">
                <div className="w-28 bg-gray-200 rounded-lg flex justify-center items-center overflow-hidden">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>

                <label className="text-teal-600 cursor-pointer hover:underline">
                  Upload from device
                  <input type="file" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            {/* Inputs */}
            <InputField label="2. Full Name" name="fullName" value={profile.fullName} onChange={handleInput} />
            <InputField label="3. Specialization" name="specialization" value={profile.specialization} onChange={handleInput} />
            <InputField label="4. License Number" name="license" value={profile.license} onChange={handleInput} />
            <InputField label="5. Years of Experience" name="experience" value={profile.experience} onChange={handleInput} />
            
            {/* Bio */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">5. Short Bio</p>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInput}
                className="w-full bg-gray-100 rounded-md px-4 py-2 h-28 outline-none"
              />
            </div>

            {/* Save button */}
            <button
              onClick={saveProfile}
              className="bg-teal-600 text-white px-6 py-2 rounded-md float-right"
            >
              Save
            </button>
          </div>
        )}

        {/* ==========================
              PREVIEW MODE
        ========================== */}
        {!isEditing && (
          <div className="mt-8 space-y-6">
            {/* Profile Photo */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">1. Profile Photo</p>
              <img
                src={profile.photo}
                alt="Profile"
                className="w-28 h-32 rounded-lg object-cover"
              />
            </div>

            <PreviewField label="2. Full Name" value={profile.fullName} />
            <PreviewField label="3. Specialization" value={profile.specialization} />
            <PreviewField label="4. License Number" value={profile.license} />
            <PreviewField label="5. Years of Experience" value={profile.experience + " years"} />
            <PreviewField label="6. Short Bio" value={profile.bio} />

            <button
              onClick={() => setIsEditing(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-md float-right"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== REUSABLE INPUT FIELD COMPONENT ========== */
function InputField({ label, name, value, onChange }: any) {
  return (
    <div>
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none"
        type="text"
      />
    </div>
  );
}

/* ========== REUSABLE PREVIEW COMPONENT ========== */
function PreviewField({ label, value }: any) {
  return (
    <div>
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="font-bold text-teal-800">{value || "—"}</p>
    </div>
  );
}
