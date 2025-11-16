'use client';

import React, { useState } from "react";
import Calendar from "react-calendar";

export default function AppointmentsPage(){
    const [date, setDate] = useState<any>(new Date());

    return (
        <div className="p-6">
        <h1 className="text-2xl text-[#006a71] font-semibold mb-6">Appointments</h1>

        <div className="flex space-x-6">
          {/* Calendar */}
          <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
            <Calendar
              onChange={setDate}
              value={date}
              prev2Label={null}
              next2Label={null}
              className="rounded-xl overflow-hidden shadow-sm !w-full text-[#006a71]"
              tileContent={({ date }) => {
                const day = date.getDate();
                const dots = [17, 18, 27, 15]; // Example
                return dots.includes(day) ? (
                  <div className="flex justify-center mt-1">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                  </div>
                ) : null;
              }}
            />
          </div>

          {/* Pending Requests */}
          <div className="w-80 bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Pending Requests</h2>

            <div className="mt-4 space-y-3">
              {[
                { name: "John Cruz", message: "New appointment" },
                { name: "Paul Tomas", message: "New appointment" },
                { name: "Amy Dela", message: "Wants to reschedule" },
              ].map((req, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-gray-500">{req.message}</p>
                  </div>

                  <button className="text-teal-600 font-semibold text-sm hover:underline">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Table */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-2">Time</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {[
                { time: "8:30 AM", name: "John Cruz", status: "Pending" },
                { time: "9:15 AM", name: "Maria Lopez", status: "Confirmed" },
                { time: "10:00 AM", name: "Ana Reyes", status: "Confirmed" },
                { time: "11:30 AM", name: "Paul Tomas", status: "Pending" },
                { time: "1:30 PM", name: "Carl Ramos", status: "Confirmed" },
              ].map((appt, i) => (
                <tr key={i} className="border-b h-14">
                  <td>{appt.time}</td>

                  <td className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-gray-300 rounded-full"></span>
                    <span>{appt.name}</span>
                    <button className="text-teal-600 text-xs ml-3 hover:underline">
                      View
                    </button>
                  </td>

                  <td>
                    <span
                      className={`${
                        appt.status === "Pending"
                          ? "text-yellow-500"
                          : "text-teal-600"
                      } font-medium`}
                    >
                      {appt.status}
                    </span>
                  </td>

                  <td className="space-x-2">
                    {appt.status === "Pending" && (
                      <>
                        <button className="px-4 py-1 bg-teal-600 text-white rounded-md text-xs">
                          Accept
                        </button>
                        <button className="px-4 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                          Reschedule
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    )
}