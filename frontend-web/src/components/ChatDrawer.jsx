import React, { useState, useEffect, useRef } from 'react';
import { fetchContacts, searchUser, fetchChatHistory, sendMessage } from '../api/messages';
import { getProfileFromStorage } from '../api/auth';

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // the user we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const currentUser = getProfileFromStorage();
  const messagesEndRef = useRef(null);

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const formatRole = (roleStr) => {
    if (roleStr === 'ROLE_TEACHER') return 'PROFESOR';
    if (roleStr === 'ROLE_STUDENT') return 'STUDENT';
    if (roleStr === 'ROLE_ADMIN') return 'ADMIN';
    return roleStr;
  };


  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeChat) {
      loadHistory();
      const interval = setInterval(loadHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContacts = async () => {
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (err) {
      console.error('Eroare la contacte', err);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      try {
        const data = await searchUser(q);
        setSearchResults(data.filter(u => u.id !== currentUser.userId));
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const openChat = (user) => {
    setActiveChat(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const loadHistory = async () => {
    if (!activeChat) return;
    try {
      const history = await fetchChatHistory(activeChat.id);
      setMessages(history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      await sendMessage(activeChat.id, newMessage);
      setNewMessage('');
      loadHistory(); // reload history instantly
    } catch (err) {
      alert("Nu s-a putut trimite mesajul");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all z-50"
      >
        <span className="material-symbols-outlined text-2xl">{isOpen ? 'close' : 'chat'}</span>
        {totalUnread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a2230]">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-[#1a2230] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col z-50 overflow-hidden">
          
          {!activeChat ? (
            <div className="flex flex-col h-full">
              <div className="p-4 bg-indigo-600 text-white">
                <h3 className="font-bold text-lg">Mesagerie Privată</h3>
              </div>
              
              <div className="p-3 border-b dark:border-gray-700">
                <input 
                  type="text"
                  placeholder="Caută pe cineva..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {searchQuery.length > 2 ? (
                  <div>
                    <p className="text-xs font-bold text-gray-500 p-3 uppercase tracking-wider">Rezultate Căutare</p>
                    {searchResults.map(u => (
                      <div key={u.id} onClick={() => openChat(u)} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-gray-500">{formatRole(u.role)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-gray-500 p-3 uppercase tracking-wider">Contacte Recente</p>
                    {contacts.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center">Nicio conversație recentă.</p>
                    ) : (
                      contacts.map(u => (
                        <div key={u.id} onClick={() => openChat(u)} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-xs text-gray-500">{formatRole(u.role)}</p>
                          </div>
                          {u.unreadCount > 0 && (
                            <div className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                              {u.unreadCount > 9 ? '9+' : u.unreadCount}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 bg-indigo-600 text-white flex items-center gap-3 shadow-md z-10">
                <button onClick={() => setActiveChat(null)} className="hover:bg-indigo-700 p-1 rounded-full flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div className="flex-1">
                  <h3 className="font-bold text-sm leading-tight">{activeChat.name}</h3>
                  <p className="text-[10px] opacity-80">{formatRole(activeChat.role)}</p>
                </div>
              </div>

              {/* Mesaje */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#121826] space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm mt-10">Începe conversația...</p>
                ) : (
                  messages.reduce((acc, msg, index, array) => {
                    const isMe = msg.sender.id === currentUser.userId;
                    const currentDateString = new Date(msg.timestamp).toLocaleDateString('ro-RO');
                    const previousDateString = index === 0 ? null : new Date(array[index - 1].timestamp).toLocaleDateString('ro-RO');
                    const showDateDivider = currentDateString !== previousDateString;

                    if (showDateDivider) {
                      acc.push(
                        <div key={`date-${currentDateString}`} className="flex justify-center my-4">
                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      );
                    }

                    acc.push(
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-tl-none'}`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 mx-1">
                          {new Date(msg.timestamp).toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );

                    return acc;
                  }, [])
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input formular */}
              <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1a2230] border-t dark:border-gray-700 flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          )}

        </div>
      )}
    </>
  );
}
