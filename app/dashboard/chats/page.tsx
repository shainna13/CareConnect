"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/src/lib/context/UserContext";
import { db } from "@/app/src/lib/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

interface Chat {
  id: string;
  name: string;
  last: string;
  avatar: string | null;
  hasUnread: boolean;
  lastTime: string;
  otherUserId: string;
  isDoctor: boolean;
  unreadCount: number;
  doctor: string;
  client: string;
}

interface ChatMessage {
  id: string;
  type: string;
  message?: string;
  medicineName?: string;
  timestamp: number;
}

export default function ChatsPage() {
  const { accountData } = useUser();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string>("");

  // Get doctor ID from context or localStorage
  useEffect(() => {
    const id = accountData?.id || localStorage.getItem('doctorId') || "";
    setDoctorId(id);
  }, [accountData?.id]);

  // Fetch all chats for the current user using Firebase with real-time listener
  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Use real-time listener instead of one-time fetch for instant updates
      const chatsRef = collection(db, "chats");
      
      // Query for chats where user is doctor (no orderBy to avoid index requirement)
      const q1 = query(
        chatsRef,
        where("doctor", "==", doctorId)
      );

      // Query for chats where user is client (no orderBy to avoid index requirement)
      const q2 = query(
        chatsRef,
        where("client", "==", doctorId)
      );

      // Subscribe to both queries
      const unsubscribe1 = onSnapshot(
        q1,
        (snapshot) => {
          handleSnapshotUpdate(snapshot, doctorId, "doctor");
        },
        (error) => {
          console.error("Error fetching doctor chats:", error);
          setLoading(false);
        }
      );

      const unsubscribe2 = onSnapshot(
        q2,
        (snapshot) => {
          handleSnapshotUpdate(snapshot, doctorId, "client");
        },
        (error) => {
          console.error("Error fetching client chats:", error);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    } catch (error) {
      console.error("Error setting up chat listeners:", error);
      setLoading(false);
    }
  }, [doctorId]);

  // Helper function to process chat snapshots
  const handleSnapshotUpdate = async (snapshot: any, doctorId: string, role: "doctor" | "client") => {
    // Cache to avoid refetching user data for multiple chats
    const userDataCache: Record<string, any> = {};

    const chatPromises = snapshot.docs.map(async (chatDoc: any) => {
      const chat = chatDoc.data();
      const isDoc = doctorId === chat.doctor;
      const otherUserId = isDoc ? chat.client : chat.doctor;

      // Use cache or fetch user data
      let photoURL = null;
      let otherUserName = "";

      if (userDataCache[otherUserId]) {
        const cached = userDataCache[otherUserId];
        photoURL = cached.photo;
        otherUserName = cached.name;
      } else {
        try {
          const userDocRef = doc(db, "accounts", otherUserId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            photoURL = userData.photo || null;
            // Get name from the actual user account (both doctors and patients use 'name' field)
            const name = userData.name || userData.patientName || (isDoc ? "Patient" : "Doctor");
            
            // Cache the user data
            userDataCache[otherUserId] = {
              photo: photoURL,
              name: name,
            };

            otherUserName = name;
          }
        } catch (e) {
          console.error("Error loading user data:", e);
          otherUserName = isDoc ? "Patient" : "Doctor";
        }
      }

      // Fetch last message from convo subcollection
      let lastMessage = "No messages yet";
      let lastTime = "";

      try {
        const convoRef = collection(db, "chats", chatDoc.id, "convo");
        const msgQuery = query(convoRef, orderBy("timestamp", "desc"), limit(1));
        const msgSnapshot = await getDocs(msgQuery);

        if (!msgSnapshot.empty) {
          const lastMsg = msgSnapshot.docs[0].data();

          // Handle different message types
          if (lastMsg.type === "text") {
            lastMessage = lastMsg.message || "No messages yet";
          } else if (lastMsg.type === "prescription") {
            lastMessage = `Prescription: ${lastMsg.medicineName || "Medicine"}`;
          } else {
            lastMessage = `${(lastMsg.type || "MESSAGE").toUpperCase()}`;
          }

          // Format time
          if (lastMsg.timestamp) {
            const messageTime = new Date(lastMsg.timestamp.toMillis ? lastMsg.timestamp.toMillis() : lastMsg.timestamp);
            const now = new Date();
            const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const msgDate = new Date(messageTime.getFullYear(), messageTime.getMonth(), messageTime.getDate());
            const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (msgDate.getTime() === todayDate.getTime()) {
              lastTime = `${messageTime.getHours().toString().padStart(2, "0")}:${messageTime.getMinutes().toString().padStart(2, "0")}`;
            } else if (msgDate.getTime() === yesterday.getTime()) {
              lastTime = "Yesterday";
            } else {
              lastTime = `${messageTime.getMonth() + 1}/${messageTime.getDate()}`;
            }
          }
        }
      } catch (e) {
        console.error("Error loading last message:", e);
      }

      const unreadCountKey = isDoc ? "unreadCountDoctor" : "unreadCountClient";
      const unreadCount = chat[unreadCountKey] ?? 0;

      return {
        id: chatDoc.id,
        name: otherUserName,
        last: lastMessage,
        avatar: photoURL,
        hasUnread: unreadCount > 0,
        lastTime: lastTime,
        otherUserId: otherUserId,
        isDoctor: isDoc,
        unreadCount: unreadCount,
        doctor: chat.doctor,
        client: chat.client,
      };
    });

    const processedChats = await Promise.all(chatPromises);
    
    // Merge with existing chats to avoid duplicates and maintain both doctor and client chats
    setChats((prevChats) => {
      const chatMap = new Map(prevChats.map((c) => [c.id, c]));
      
      // Update with new chats from this snapshot
      processedChats.forEach((chat) => {
        chatMap.set(chat.id, chat);
      });

      // Convert back to array and sort by lastTime
      const merged = Array.from(chatMap.values());
      return merged.sort((a, b) => {
        const timeA = a.lastTime || "";
        const timeB = b.lastTime || "";
        return timeB.localeCompare(timeA);
      });
    });

    setLoading(false);
  };

  const handleMessageSent = (chatId: string, newMessage: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, last: newMessage, lastTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : chat
      )
    );
  };

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex w-full h-screen bg-[#CCE5E7] overflow-hidden">
      <main className="flex-1 flex h-full shadow-xl">
        <ChatList
          chats={chats}
          selectedChat={selectedChatId}
          onSelectChat={setSelectedChatId}
          loading={loading}
        />

        {selectedChat && (
          <ChatWindow 
            chat={selectedChat} 
            onMessageSent={handleMessageSent} 
          />
        )}
      </main>
    </div>
  );
}