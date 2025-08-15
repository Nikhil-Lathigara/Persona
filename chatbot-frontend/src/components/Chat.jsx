import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const Chat = ({ selectedMentor, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const guestToken = useRef(
    localStorage.getItem('guestToken') || 
    `guest-${Math.random().toString(36).substring(2, 15)}`
  );

  // Load messages from localStorage when component mounts
  useEffect(() => {
    // Ensure guestToken is saved
    localStorage.setItem('guestToken', guestToken.current);
    
    // Load saved messages
    const savedMessages = localStorage.getItem(`chat-${selectedMentor.id}-${guestToken.current}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, [selectedMentor.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  const simulateTyping = (text, typingDelay) => {
    setIsTyping(true);
    setTypingText('');
    setCurrentTypingIndex(0);

    // Split by words but preserve HTML tags
    const words = text.match(/<[^>]+>|[^<\s]+/g) || [];
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < words.length) {
        setTypingText(prev => prev + (prev ? ' ' : '') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Update messages with assistant response
        setMessages(prevMessages => {
          const updatedMessages = [
            ...prevMessages,
            { role: 'assistant', content: text },
          ];
          
          // Save to localStorage after assistant response
          localStorage.setItem(
            `chat-${selectedMentor.id}-${guestToken.current}`, 
            JSON.stringify(updatedMessages)
          );
          
          return updatedMessages;
        });
      }
    }, typingDelay / words.length);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Update messages with user message
    setMessages(prevMessages => {
      const updatedMessages = [
        ...prevMessages,
        { role: 'user', content: userMessage },
      ];
      
      // Save to localStorage
      localStorage.setItem(
        `chat-${selectedMentor.id}-${guestToken.current}`, 
        JSON.stringify(updatedMessages)
      );
      
      return updatedMessages;
    });

    setIsLoading(true);
    try {
      const response = await fetch('https://persona-pmor.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          mentorId: selectedMentor.id,
          sessionId: selectedMentor.id + '-' + guestToken.current
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setIsLoading(false);
      simulateTyping(data.message, data.typingDelay || 2000);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      simulateTyping('Sorry, there was an error. Please try again.', 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black">
      <div className="h-full max-w-4xl mx-auto px-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center py-4 px-2 sticky top-0 z-10 bg-black/60 backdrop-blur-md rounded-b-xl border-b border-white/10">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full text-orange-400 hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <img 
            src={selectedMentor.image} 
            alt={selectedMentor.name}
            className="w-10 h-10 rounded-full mr-3 border-2 border-orange-400 object-cover"
          />
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            {selectedMentor.name}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-custom">
          <div className="space-y-4 px-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl shadow-lg 
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'bg-gradient-to-r from-gray-800 to-gray-700/90'}
                    hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <div className="prose prose-invert max-w-none leading-relaxed space-y-2">
                    {message.role === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      <div 
                        className="[&_a]:text-orange-400 [&_a]:underline hover:[&_a]:text-orange-300
                                 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:ml-4"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[85%] p-3 rounded-xl shadow-lg bg-gradient-to-r from-gray-800 to-gray-700/90">
                  <div className="prose prose-invert max-w-none">
                    {typingText}
                    <span className="inline-block w-1.5 h-4 bg-orange-400/80 animate-pulse ml-0.5"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="mt-2 py-4 px-2 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 text-white placeholder-white/40 
                border border-white/10 rounded-xl px-4 py-3
                focus:border-orange-400 focus:ring-1 focus:ring-orange-400 
                focus:outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 
                text-white font-medium hover:from-orange-500 hover:to-red-500 
                active:from-orange-600 active:to-red-600
                hover:-translate-y-0.5 active:translate-y-0 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                whitespace-nowrap`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
