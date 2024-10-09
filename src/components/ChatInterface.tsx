import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { getGeminiResponse } from '../lib/gemini';
import { databases, databaseId, collectionId } from '../lib/appwrite';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      const response = await getGeminiResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Save the conversation to Appwrite
      await databases.createDocument(databaseId, collectionId, 'unique()', {
        user_message: input,
        ai_response: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setIsLoading(false);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gray-100 p-4 rounded-lg mb-4 h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
          placeholder="Type your message..."
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="mt-4">View Conversation History</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Conversation History</SheetTitle>
            <SheetDescription>
              Your past conversations will be displayed here.
            </SheetDescription>
          </SheetHeader>
          {/* Add conversation history display logic here */}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatInterface;