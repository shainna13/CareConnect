"use client";

import React, { useState } from "react";
import ChatList from "./components/ChatList"; // Adjust path if needed
import ChatWindow from "./components/ChatWindow"; // Adjust path if needed

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  // [FIREBASE - BACKEND] 1. FETCH CONVERSATIONS LIST
  // Use `useEffect` with `onSnapshot` to listen to a "chats" collection.
  // Query: where('participants', 'array-contains', currentUser.uid).
  // Order: orderBy('updatedAt', 'desc') to show newest chats first.
  // The 'last' field below represents the 'lastMessage' stored on the parent chat document.
  const [chats, setChats] = useState([
    { 
      id: 1, // Firestore Document ID
      name: "John Cruz", 
      // ✅ UPDATE THIS LINE to match the only message left in ChatWindow
      // [FIREBASE - BACKEND] Map this to 'lastMessage' field in Firestore document
      last: "Hello John Cruz! Dr. Sarah Watson confirmed your appointment request. Please wait for your appointment schedule.", 
      avatar: "https://placehold.co/40x40/48A6A7/FFFFFF?text=J" 
    },
  ]);

  // [FIREBASE - BACKEND] 2. SEND MESSAGE HANDLER
  // This function is triggered when the user sends a message in ChatWindow.
  // REQUIRED ACTIONS:
  // A. Add a new document to the "messages" subcollection: collection('chats', chatId, 'messages').
  // B. Update the parent document: doc('chats', chatId) with { last: newMessage, updatedAt: serverTimestamp() }.
  const handleMessageSent = (chatId: number, newMessage: string) => {
    // 3. Optimistic UI Update
    // (This updates the local state immediately while Firebase processes in the background)
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, last: newMessage } : chat
      )
    );
  };

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="flex w-full h-screen bg-[#CCE5E7] overflow-hidden">
      <main className="flex-1 flex h-full shadow-xl">
        
        {/* Pass the state 'chats' to the list */}
        {/* [FIREBASE - BACKEND] Ensure ChatList can handle the data structure mapped above */}
        <ChatList
          chats={chats}
          selectedChat={selectedChatId}
          onSelectChat={setSelectedChatId}
        />

        {/* Pass the update function 'onMessageSent' to the window */}
        {/* [FIREBASE - BACKEND] ChatWindow needs to fetch the specific 'messages' subcollection based on selectedChat.id */}
        <ChatWindow 
          chat={selectedChat} 
          onMessageSent={handleMessageSent} 
        />
      </main>
    </div>
  );
}