import React from "react";

export default function ChatList({ chats, selectedChat, onSelectChat }: any) {
  return (
    <div className="w-1/3 border-r border-gray-200 h-full flex flex-col bg-[#A3D2D2]">
      
      {/* Header & Search */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-[#006A71] mb-4">Chats</h1>
        
        {/* Search Bar Container */}
        <div className="relative">
          {/* Search Icon */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#006A71] opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>

          {/* [FIREBASE - BACKEND] SEARCH FUNCTIONALITY */}
          {/* 1. Create a local state for 'searchTerm'. */}
          {/* 2. Bind this input's onChange to set the searchTerm. */}
          {/* 3. Filter the 'chats' array below based on whether chat.name includes the searchTerm. */}
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#E0F2F1] text-[#006A71] placeholder-[#006A71]/50 pl-10 pr-4 py-2 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-[#006A71]/20 transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* [FIREBASE - BACKEND] RENDER LIST */}
        {/* The 'chats' prop is passed from the parent component (ChatsPage). */}
        {/* It contains the real-time snapshot of the "chats" collection. */}
        {chats.map((chat: any) => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat.id)} 
            className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[#006A71]/20 hover:bg-[#88bebe] transition-colors ${selectedChat === chat.id ? "" : ""}`}
          >
            {/* [FIREBASE - BACKEND] AVATAR */}
            {/* 'chat.avatar' should be a download URL from Firebase Storage or a placeholder string */}
            <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-white flex-shrink-0" />
            
            <div className="overflow-hidden">
              {/* [FIREBASE - BACKEND] CHAT METADATA */}
              {/* 'chat.name': The name of the participant (Patient or Doctor) */}
              <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
              
              {/* 'chat.last': The 'lastMessage' field from the Firestore document */}
              <p className="text-sm text-gray-600 truncate">{chat.last}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}