import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BookOpen, History, Send } from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';
import { databases, databaseId, collectionId } from '../lib/appwrite';
import { Query } from 'appwrite';

const useTypingEffect = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;

    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

interface Message {
  role: string;
  content: string;
  vocabularies?: string[];
}

interface HistoryItem {
  id: string;
  messages: Message[];
  timestamp: string;
}

const formatText = (text: string) => {
  // Handle bold text
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle line break
  text = text.replace(/\n/g, '<br>');
  
  return text;
};

export default function QuickVocab() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [thinkingText, setThinkingText] = useState('');
  const { displayedText: typedThinkingText, isTyping: isTypingThinking } = useTypingEffect(thinkingText, 30);
  const { displayedText: typedLatestMessage } = useTypingEffect(messages[messages.length - 1]?.content || '', 30);
  const chatSessionId = useRef<string | null>(null);

  const fetchConversationHistory = async () => {
    try {
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.orderDesc('timestamp'),
        Query.limit(100)
      ]);
      console.log('Fetched history:', response);
      setHistory(response.documents.map(doc => ({
        id: doc.$id,
        messages: doc.messages,
        timestamp: doc.timestamp
      })));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  useEffect(() => {
    fetchConversationHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setThinkingText('Thinking...');

    try {
      const response = await getGeminiResponse(input);
      setThinkingText('');

      const { content, vocabularies } = parseGeminiResponse(response);
      const formattedContent = formatText(content);
      const newAIMessage = { role: 'assistant', content: formattedContent, vocabularies };
      const updatedMessages = [...messages, newUserMessage, newAIMessage];
      setMessages(updatedMessages);

      if (!chatSessionId.current) {
        chatSessionId.current = 'unique_' + Date.now(); // Generate a unique ID
      }

      // Save to history database
      const result = await databases.createDocument(
        databaseId, 
        collectionId, 
        chatSessionId.current,
        {
          messages: updatedMessages,
          timestamp: new Date().toISOString(),
        }
      );

      console.log('Saved to history database:', result);

      // Update history after successful save
      fetchConversationHistory();
    } catch (error) {
      console.error('Error:', error);
      setThinkingText('');
    }

    setIsLoading(false);
    setInput('');
  };

   // Function to parse Gemini response and extract vocabularies
  const parseGeminiResponse = (response: string) => {
    const parts = response.split('VOCABULARIES:');
    const content = parts[0].trim();
    const vocabularies = parts[1] ? parts[1].trim().split(',').map(v => v.trim()) : [];
    return { content, vocabularies };
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewSession = () => {
    setMessages([]);
    chatSessionId.current = null;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Quick Vocab
          </CardTitle>
          <CardDescription>Expand your vocabulary with AI-powered learning</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span 
                  className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground text-left' : 'bg-muted'}`}
                  dangerouslySetInnerHTML={{
                    __html: index === messages.length - 1 && message.role === 'assistant' 
                      ? formatText(typedLatestMessage) 
                      : message.content
                  }}
                />
                {message.vocabularies && message.vocabularies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.vocabularies.map((vocab, i) => (
                      <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {vocab}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTypingThinking && (
              <div className="mb-4 text-left">
                <span className="inline-block p-2 rounded-lg bg-muted">
                  {typedThinkingText}
                </span>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a word or phrase..."
              className="flex-grow"
            />
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? 'Sending...' : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button onClick={startNewSession}>Start New Session</Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              View Conversation History
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Conversation History</SheetTitle>
              <SheetDescription>
                Your past conversations will be displayed here.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100vh-200px)] w-full">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="mb-4 p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedHistoryItem(item)}
                >
                  <p className="font-bold">Session: {item.id}</p>
                  <p className="truncate"><strong>User:</strong> {item.messages[0]?.content}</p>
                  <p className="truncate"><strong>AI:</strong> {item.messages[1]?.content}</p>
                  <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {selectedHistoryItem && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Selected Conversation</CardTitle>
            <CardDescription>Session: {selectedHistoryItem.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {selectedHistoryItem.messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}