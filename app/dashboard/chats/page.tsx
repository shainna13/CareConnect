"use client";

import React, { useState } from "react";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    { id: 1, name: "John Cruz", last: "Hey, how are you?", avatar: "/avatar1.png" },
    { id: 2, name: "Maria Lopez", last: "Your appointment is confirmed.", avatar: "/avatar2.png" },
    { id: 3, name: "David Kim", last: "Thanks doctor!", avatar: "/avatar3.png" }
  ];

  return (
    <div className="flex w-full h-full bg-[#e7f2f4]">
      {/* Chat list area */}
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />

      {/* Chat Window */}
      <ChatWindow chat={chats.find((c) => c.id === selectedChat)} />
    </div>
  );
}
