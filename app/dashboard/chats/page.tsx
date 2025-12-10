"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/src/lib/context/UserContext";
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

  // Fetch all chats for the current user
  useEffect(() => {
    const fetchChats = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch chats from Firestore
        const response = await fetch(`/api/chats/list?userId=${doctorId}`);
        const data = await response.json();

        if (data.chats && Array.isArray(data.chats)) {
          // Process each chat to get last message and metadata
          const processedChats = await Promise.all(
            data.chats.map(async (chat: any) => {
              const isDoc = doctorId === chat.doctor;
              const chatTitle = isDoc ? (chat.clientName || 'Patient') : (chat.doctorName || 'Doctor');
              const otherUserId = isDoc ? chat.client : chat.doctor;
              const unreadCountKey = isDoc ? 'unreadCountDoctor' : 'unreadCountClient';
              const unreadCount = chat[unreadCountKey] ?? 0;

              // Fetch other user's photo
              let photoURL = null;
              try {
                const userResponse = await fetch(`/api/user/photo?userId=${otherUserId}`);
                const userData = await userResponse.json();
                photoURL = userData.photo || null;
              } catch (e) {
                console.error('Error loading photo:', e);
              }

              // Fetch last message from convo subcollection
              let lastMessage = 'No messages yet';
              let lastTime = '';

              try {
                const convoResponse = await fetch(`/api/chats/${chat.id}/lastMessage`);
                const convoData = await convoResponse.json();

                if (convoData.message) {
                  const lastMsg = convoData.message;
                  
                  // Handle different message types
                  if (lastMsg.type === 'text') {
                    lastMessage = lastMsg.message || 'No messages yet';
                  } else if (lastMsg.type === 'prescription') {
                    lastMessage = `Prescription: ${lastMsg.medicineName || 'Medicine'}`;
                  } else {
                    lastMessage = `${(lastMsg.type || 'MESSAGE').toUpperCase()}`;
                  }

                  // Format time
                  if (lastMsg.timestamp) {
                    const messageTime = new Date(lastMsg.timestamp);
                    const now = new Date();
                    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    const msgDate = new Date(messageTime.getFullYear(), messageTime.getMonth(), messageTime.getDate());
                    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    if (msgDate.getTime() === todayDate.getTime()) {
                      // Today - show time
                      lastTime = `${messageTime.getHours().toString().padStart(2, '0')}:${messageTime.getMinutes().toString().padStart(2, '0')}`;
                    } else if (msgDate.getTime() === yesterday.getTime()) {
                      // Yesterday
                      lastTime = 'Yesterday';
                    } else {
                      // Older - show date
                      lastTime = `${messageTime.getMonth() + 1}/${messageTime.getDate()}`;
                    }
                  }
                }
              } catch (e) {
                console.error('Error loading last message:', e);
              }

              return {
                id: chat.id,
                name: chatTitle,
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
            })
          );

          setChats(processedChats);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    fetchChats();
  }, [doctorId]);

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