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
    <div className="flex-1 h-screen overflow-y-auto p-8 ml-0 transition-all duration-300">
   <h1 className="text-3xl font-bold text-[#006A71] mb-6">Create Profile</h1>

      <div className="space-y-8">
        {/* Personal Info Card */}
        <div className="bg-white rounded-lg shadow-lg">
          <form>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Personal Info</h2>

              <div className="flex items-center gap-4">
                <div
                  id="profile-image-preview"
                  className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"
                >
                  <svg
                    className="w-10 h-10"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </div>

                <input
                  type="file"
                  id="profile-image-upload"
                  className="hidden"
                  accept="image/*"
                  required
                  autoComplete="off"
                />

                <a
                  href="#"
                  id="upload-image-link"
                  className="text-sm font-medium text-[#006A71] hover:underline"
                >
                  [Upload from device]
                </a>
              </div>

              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input type="text" id="full-name" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input type="text" id="specialization" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="license-number" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input type="text" id="license-number" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input type="number" id="experience" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Bio
                </label>
                <textarea id="bio" rows="4" className="form-input" required autoComplete="off"></textarea>
              </div>

              <div id="personal-form-msg" className="text-sm mt-2"></div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg text-right">
              <button type="submit" className="btn-save">
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-lg shadow-lg">
          <form>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Contact Info</h2>

              <div>
                <label htmlFor="clinic-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic / Hospital Name
                </label>
                <input type="text" id="clinic-name" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="contact-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input type="tel" id="contact-number" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input type="email" id="email" className="form-input" required autoComplete="off" />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input type="text" id="location" className="form-input" required autoComplete="off" />
              </div>

              <div id="contact-form-msg" className="text-sm mt-2"></div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg text-right">
              <button type="submit" className="btn-save">
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Availability and Schedule Card */}
        <div className="bg-white rounded-lg shadow-lg">
          <form>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Availability and Schedule</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Open Days</label>
                <div id="open-days-container" className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <button key={day} type="button" data-day={day} className="day-toggle-button">
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                <div className="flex items-center gap-4">
                  <input type="time" id="hours-from" className="form-input" required autoComplete="off" />
                  <span className="text-gray-600">to</span>
                  <input type="time" id="hours-to" className="form-input" required autoComplete="off" />
                </div>
              </div>

              <div id="schedule-form-msg" className="text-sm mt-2"></div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg text-right">
              <button type="submit" className="btn-save">
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Delete Account Card */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Deleting your account is permanent and cannot be undone. All your data will be lost.
            </p>
            <div className="text-right mt-4">
              <button type="button" id="delete-account-button" className="btn-delete">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8"></div>
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
