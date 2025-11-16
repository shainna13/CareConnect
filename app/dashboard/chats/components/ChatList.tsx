import React from "react";

export default function ChatList({ chats, selectedChat, onSelectChat }: any) {
  return (
    <div className="w-1/3 max-w-xs bg-[#b7d8d8] border-r border-gray-300 flex flex-col">
      <h2 className="text-xl font-bold px-4 py-4 text-gray-700">Chats</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search"
        className="mx-4 mb-4 px-3 py-2 rounded-full outline-none"
      />

      {/* Chat items */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center p-3 cursor-pointer hover:bg-[#a7cdcd] transition
              ${selectedChat === chat.id ? "bg-[#88bebe]" : ""}`}
          >
            <img
              src={chat.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div>
              <p className="font-semibold">{chat.name}</p>
              <p className="text-sm text-gray-700 truncate">{chat.last}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
