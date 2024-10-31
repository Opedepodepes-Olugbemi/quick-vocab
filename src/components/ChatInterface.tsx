import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BookOpen, History, Send, LogOut } from 'lucide-react';
import { getGeminiResponse } from '../lib/gemini';
import { databases, databaseId, account, getUserCollection } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ID } from 'appwrite';

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
  title?: string;
}

const formatText = (text: string) => {
  // Handle bold text
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return text;
};

// Add this function to generate a session title from the user's message
const generateSessionTitle = (message: string) => {
  // Take first 30 characters of the message and add ellipsis if longer
  const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
  return title;
};

const handleLogout = async () => {
  try {
    await account.deleteSession('current');
    window.location.reload(); // Reload page to return to login
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

interface Props {
  userInfo: {
    $id: string;
    name: string;
    prefs?: {
      avatar?: string;
    };
  };
}

export default function QuickVocab({ userInfo }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [thinkingText, setThinkingText] = useState('');
  const { displayedText: typedThinkingText, isTyping: isTypingThinking } = useTypingEffect(thinkingText, 30);
  const { displayedText: typedLatestMessage } = useTypingEffect(messages[messages.length - 1]?.content || '', 30);
  const chatSessionId = useRef<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [userCollectionId, setUserCollectionId] = useState<string | null>(null);

  useEffect(() => {
    const setupUserCollection = async () => {
      if (userInfo?.$id) {
        try {
          const collectionId = await getUserCollection(userInfo.$id);
          setUserCollectionId(collectionId);
          console.log('Using collection:', collectionId);
        } catch (error) {
          console.error('Error setting up user collection:', error);
        }
      }
    };

    setupUserCollection();
  }, [userInfo?.$id]);

  const fetchConversationHistory = async () => {
    if (!userInfo?.$id) return;
    
    setIsHistoryLoading(true);
    try {
      const response = await databases.listDocuments(
        databaseId,
        'conversations',
        [
          Query.equal('userId', userInfo.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      console.log('Raw history response:', response);

      if (response.documents.length > 0) {
        const formattedHistory = response.documents
          .map(doc => {
            console.log('Processing document:', doc);
            try {
              const parsedMessages = JSON.parse(doc.messages);
              // Ensure the parsed data matches HistoryItem type
              const historyItem: HistoryItem = {
                id: doc.$id,
                messages: parsedMessages,
                timestamp: doc.$createdAt,
                title: doc.title
              };
              return historyItem;
            } catch (parseError) {
              console.error('Error parsing messages for document:', doc.$id, parseError);
              return null;
            }
          })
          .filter((item): item is HistoryItem => item !== null); // Type guard to filter out null values

        console.log('Formatted history:', formattedHistory);
        setHistory(formattedHistory);
      } else {
        console.log('No documents found in response');
        setHistory([]);
      }
    } catch (error: any) {
      console.error('History fetch error:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error?.response
      });
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Verify Appwrite setup
    const verifySetup = async () => {
      try {
        console.log('Verifying Appwrite setup...');
        console.log('Database ID:', databaseId);
        console.log('Collection ID:', userCollectionId);
        
        if (databaseId && userCollectionId) {
          const response = await databases.listDocuments(
            databaseId,
            userCollectionId
          );
          console.log('Appwrite verification successful:', response);
        } else {
          console.error('Database ID or Collection ID is null');
        }
      } catch (error) {
        console.error('Appwrite verification failed:', error);
      }
    };

    verifySetup();
    fetchConversationHistory();
  }, []);

  useEffect(() => {
    if (isSheetOpen) {
      fetchConversationHistory();
    }
  }, [isSheetOpen]);

  const handleSend = async () => {
    if (!input.trim() || !userInfo?.$id) return;

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

      const documentData = {
        messages: JSON.stringify(updatedMessages),
        userId: userInfo.$id,
        title: generateSessionTitle(input)
      };

      try {
        const result = await databases.createDocument(
          databaseId,
          'conversations',
          ID.unique(),
          documentData
        );
        console.log('Saved to history database:', result);

        await fetchConversationHistory();
      } catch (error) {
        console.error('Error saving document:', error);
      }
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Quick Vocab
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    {userInfo?.prefs?.avatar ? (
                      <AvatarImage src={userInfo.prefs.avatar} alt={userInfo.name} />
                    ) : (
                      <AvatarFallback>
                        {getInitials(userInfo?.name || 'User')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span className="font-medium">{userInfo?.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>Expand your vocabulary with AI-powered learning</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span 
                  className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
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
        <Sheet onOpenChange={setIsSheetOpen}>
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
                Your past conversations are displayed here.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100vh-200px)] w-full">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center p-4">
                  Loading history...
                </div>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="mb-4 p-2 border rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    <p className="font-bold">{item.title || 'Session: ' + item.id}</p>
                    <p className="truncate">
                      <strong>User:</strong> {item.messages[0]?.content}
                    </p>
                    <p className="truncate">
                      <strong>AI:</strong> 
                      <span dangerouslySetInnerHTML={{ 
                        __html: formatText(item.messages[1]?.content || '') 
                      }} />
                    </p>
                    <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No conversation history found
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {selectedHistoryItem && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Selected Conversation</CardTitle>
            <CardDescription>{selectedHistoryItem.title || `Session: ${selectedHistoryItem.id}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {selectedHistoryItem.messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span 
                    className={`inline-block p-2 rounded-lg ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: formatText(message.content)
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
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}