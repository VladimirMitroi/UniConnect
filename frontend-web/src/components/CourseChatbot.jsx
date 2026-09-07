import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/chatbot';
import ReactMarkdown from 'react-markdown';

function CourseChatbot({ courseId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salut! Sunt asistentul AI al acestui curs. Îți pot răspunde la întrebări folosind documentele (PDF, Word, Text, PowerPoint) atașate cursului. Cu ce te pot ajuta azi?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(courseId, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Ne pare rău, a apărut o eroare la comunicarea cu serverul AI.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-[#1a2230] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="material-symbols-outlined">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold">UniConnect AI</h3>
            <p className="text-xs text-white/80">Răspunde din materialele cursului</p>
          </div>
        </div>
      </div>

      {/* Mesaje */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 text-[#0d121b] dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[#1a2230] border-t border-gray-100 dark:border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm dark:text-white transition-all"
            placeholder="Pune o întrebare din materialele cursului..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI-ul poate face greșeli. Verifică mereu informația critică.
        </p>
      </form>
    </div>
  );
}

export default CourseChatbot;
