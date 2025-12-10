"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/app/src/lib/firebase/client";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useUser } from "@/app/src/lib/context/UserContext";
import { formatTime } from "@/app/src/lib/formatTime";

export default function NotificationsPage() {
  const { currentUser } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // [FIREBASE - BACKEND] FETCH NOTIFICATIONS (REAL-TIME LISTENER)
  // Listen to the notifications subcollection in accounts/{userId}/notifications
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Create query to fetch notifications for current user
    const notificationsRef = collection(db, "accounts", currentUser.uid, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedNotifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Format timestamp
          let formattedTime = "";
          if (data.timestamp) {
            const timestamp = data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp);
            formattedTime = formatTime(timestamp);
          }

          return {
            id: doc.id,
            name: data.name || data.sender || "Unknown",
            message: data.message || "You have a new notification",
            email: data.email || "",
            time: formattedTime,
            isRead: data.isRead || false,
            type: data.type || "notification",
            timestamp: data.timestamp,
          };
        });

        setNotifications(loadedNotifications);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // [FIREBASE - BACKEND] BATCH UPDATE (MARK ALL READ)
  const markAllAsRead = async () => {
    // Optimistic update for UI
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    
    // TODO: Add Firebase batch update logic here
  };

  // [FIREBASE - BACKEND] SINGLE DOCUMENT UPDATE
  const markAsRead = async (id: string) => {
    // Optimistic update for UI
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    // TODO: Add Firebase updateDoc logic here
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
          ) : loading ? (
            <div className="p-10 text-gray-500 text-center">Loading notifications...</div>
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
                    <p className="text-base text-[#006A71] font-medium">
                      {notification.message}
                    </p>
                    {notification.email && (
                      <p className="text-sm text-gray-500 mt-1">{notification.email}</p>
                    )}
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