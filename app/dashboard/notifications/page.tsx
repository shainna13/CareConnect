"use client";

import React, { useState } from "react";

export default function NotificationsPage() {
  // [FIREBASE - BACKEND] FETCH NOTIFICATIONS (REAL-TIME LISTENER)
  // 1. Use `useEffect` with `onSnapshot` to listen to the "notifications" collection.
  // 2. Query: where('recipientId', '==', currentUser.uid).
  // 3. Order: orderBy('timestamp', 'desc').
  // 4. Map the snapshot docs to the state object below.
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      name: "Maria Lopez",
      action: "'s appointment starts in 10 minutes.",
      time: "8:50 AM", // Convert Firestore Timestamp to formatted string
      isRead: false,
    },
    {
      id: 2,
      name: "John Cruz",
      action: " sent an appointment request.",
      time: "Nov 13",
      isRead: false,
    },
    {
      id: 3,
      name: "Ana Reyes",
      action: " sent a new message.",
      time: "Nov 12",
      isRead: true,
    },
    {
      id: 4,
      name: "Carl Ramos",
      action: " confirmed medicine taken at 8:00 AM.",
      time: "Nov 10",
      isRead: true,
    },
    {
      id: 5,
      name: "Dr. Sarah Watson",
      action: " updated your prescription details.",
      time: "Nov 09",
      isRead: true,
    },
  ]);

  // [FIREBASE - BACKEND] UNREAD COUNT
  // If using `onSnapshot` above, this calculation remains valid on the frontend.
  // Alternatively, fetch a separate count from Firestore using `count()` aggregation if the list is paginated.
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // [FIREBASE - BACKEND] BATCH UPDATE (MARK ALL READ)
  // 1. Query all documents for this user where isRead == false.
  // 2. Initialize a Firestore WriteBatch.
  // 3. Loop through documents and add update(ref, { isRead: true }) to the batch.
  // 4. await batch.commit().
  const markAllAsRead = () => {
    // Optimistic update for UI (keep this)
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    
    // TODO: Add Firebase logic here
  };

  // [FIREBASE - BACKEND] SINGLE DOCUMENT UPDATE
  // 1. Create a reference: doc(db, "notifications", id).
  // 2. await updateDoc(ref, { isRead: true }).
  const markAsRead = (id: number) => {
    // Optimistic update for UI (keep this)
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // TODO: Add Firebase logic here
  };

  return (
    <div className="w-full h-full bg-[#CCE5E7] p-8 flex flex-col">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#006A71]">Notifications</h1>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="bg-[#FE9056] text-white text-xs font-bold px-2 py-1 rounded-full ">
              {unreadCount} new
            </span>
          )}
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-semibold text-[#006A71] hover:text-[#004d52] hover:underline transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* White Container Card */}
      <div className="bg-white rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        
        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-10 text-gray-500 text-center">No notifications yet.</div>
          ) : (
            <div>
              {/* [FIREBASE - BACKEND] RENDER LIST */}
              {/* Ensure unique keys map to Firestore Document IDs */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`
                    flex items-start md:items-center p-6 border-b border-gray-100 
                    cursor-pointer transition-colors hover:bg-gray-50
                    ${notification.isRead ? 'bg-white' : 'bg-[#F0F9FA]'}
                  `}
                >
                  
                  {/* Left Column: Time */}
                  <div className="w-32 flex-shrink-0 text-sm text-gray-400 font-medium pt-1 md:pt-0">
                    {notification.time}
                  </div>

                  {/* Right Column: Message */}
                  <div className="flex-1">
                    <p className="text-base text-[#006A71]">
                      <span className="font-bold">{notification.name}</span>
                      <span className="font-medium text-gray-600">{notification.action}</span>
                    </p>
                  </div>

                  {/* Unread Indicator Dot (Orange) */}
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FE9056] ml-4 shadow-sm"></div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}