import React from "react";

export default function ChatWindow({ chat }: any) {
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
        Select a chat to begin
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-[#e3f0f1]">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b bg-white">
        <img src={chat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />
        <h2 className="text-xl font-semibold">{chat.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Demo messages */}
        <div className="bg-white p-3 rounded-lg w-fit shadow">
          Hi, how can I assist you today?
        </div>

        <div className="bg-[#a7d3d3] p-3 rounded-lg w-fit ml-auto shadow">
          I have a question about my prescription.
        </div>

        <div className="bg-white p-3 rounded-lg w-fit shadow">
          Sure! What would you like to know?
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white flex items-center border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border px-4 py-2 rounded-lg outline-none"
        />
        <button className="ml-3 bg-teal-600 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
}
