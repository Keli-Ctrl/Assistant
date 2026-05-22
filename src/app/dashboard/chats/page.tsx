'use client';

import { useState, useEffect } from 'react';

type Status = 'ACTIVE' | 'ESCALATED' | 'RESOLVED';

interface Message {
  id: string;
  sender: 'BOT' | 'CUSTOMER' | 'HUMAN';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  telegramChatId: string;
  status: Status;
  lastMessage: string;
  updatedAt: string;
  messages?: Message[];
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchConversationDetail(selectedId);
    }
  }, [selectedId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedConversation(data);
      }
    } catch (err) {
      console.error('Error fetching conversation detail:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedId || !messageText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      });
      if (res.ok) {
        setMessageText('');
        fetchConversationDetail(selectedId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: Status) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchConversations();
        fetchConversationDetail(selectedId);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'ESCALATED': return 'bg-red-100 text-red-800';
      case 'RESOLVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && conversations.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
        </div>
        <div>
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedId === conv.id ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900">{conv.telegramChatId}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(conv.status)}`}>
                    {conv.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedConversation.telegramChatId}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(selectedConversation.status)}`}>
                  {selectedConversation.status}
                </span>
              </div>
              <div className="space-x-2">
                {selectedConversation.status === 'ESCALATED' && (
                  <button 
                    onClick={() => handleUpdateStatus('ACTIVE')}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Take Over
                  </button>
                )}
                {selectedConversation.status !== 'RESOLVED' && (
                  <button 
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50"
                  >
                    Mark Resolved
                  </button>
                )}
                {selectedConversation.status === 'RESOLVED' && (
                  <button 
                    onClick={() => handleUpdateStatus('ACTIVE')}
                    className="border border-indigo-300 text-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-50"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
              {selectedConversation.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'CUSTOMER' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      msg.sender === 'CUSTOMER'
                        ? 'bg-white text-gray-800 rounded-bl-none'
                        : msg.sender === 'BOT'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-green-600 text-white rounded-br-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${msg.sender === 'CUSTOMER' ? 'text-gray-400' : 'text-indigo-200'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Placeholder */}
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={selectedConversation.status !== 'ESCALATED' && selectedConversation.status !== 'ACTIVE'}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={sending || (selectedConversation.status !== 'ESCALATED' && selectedConversation.status !== 'ACTIVE')}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
              {selectedConversation.status === 'RESOLVED' && (
                <p className="text-xs text-gray-500 mt-2 italic text-center">
                  This conversation is resolved. Reopen it to send messages.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
