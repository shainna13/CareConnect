import React, { useState } from "react";

export default function ChatList({ chats, selectedChat, onSelectChat, loading }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats based on search term
  const filteredChats = chats.filter((chat: any) =>
    chat.name && chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#E0F2F1] text-[#006A71] placeholder-[#006A71]/50 pl-10 pr-4 py-2 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-[#006A71]/20 transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#006A71] opacity-60">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#006A71] opacity-60">No chats found</p>
          </div>
        ) : (
          filteredChats.map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#006A71]/20 hover:bg-[#88bebe] transition-colors ${
                selectedChat === chat.id ? "bg-[#48A6A7]" : ""
              } ${chat.hasUnread ? "bg-[#48A6A7]" : ""}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {chat.avatar ? (
                  <img 
                    src={chat.avatar} 
                    alt={chat.name} 
                    className="w-12 h-12 rounded-full object-cover bg-white border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white">
                    <span className="text-[#006A71] font-bold text-lg">
                      {chat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {chat.hasUnread && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#48A6A7] border-2 border-[#A3D2D2]"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Chat Name */}
                <h3
                  className={`font-semibold text-gray-800 truncate ${
                    chat.hasUnread ? "font-bold text-black" : "font-medium"
                  }`}
                >
                  {chat.name}
                </h3>

                {/* Last Message */}
                <p
                  className={`text-sm truncate ${
                    chat.hasUnread
                      ? "text-gray-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {chat.last}
                </p>
              </div>

              {/* Time and Unread Indicator */}
              <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
                <span
                  className={`text-xs whitespace-nowrap ${
                    chat.hasUnread
                      ? "text-[#48A6A7] font-bold"
                      : "text-gray-400"
                  }`}
                >
                  {chat.lastTime}
                </span>
                {chat.hasUnread && (
                  <div className="w-2 h-2 rounded-full bg-[#48A6A7]"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}