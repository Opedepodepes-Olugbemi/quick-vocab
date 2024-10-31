import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search } from 'lucide-react';

interface LanguageOption {
  id: string;
  name: string;
  flag: string;
  description: string;
}

const languages: LanguageOption[] = [
  {
    id: 'english',
    name: 'English',
    flag: '🇬🇧',
    description: 'Learn English vocabulary and expressions'
  },
  {
    id: 'french',
    name: 'French',
    flag: '🇫🇷',
    description: 'Apprenez le vocabulaire et les expressions françaises'
  },
  {
    id: 'spanish',
    name: 'Spanish',
    flag: '🇪🇸',
    description: 'Aprende vocabulario y expresiones en español'
  }
];

interface LanguageSelectionProps {
  onLanguageSelect: (language: string) => void;
}

export default function LanguageSelection({ onLanguageSelect }: LanguageSelectionProps) {
  const [customLanguage, setCustomLanguage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLanguageSubmit = async () => {
    if (!customLanguage.trim()) return;
    
    try {
      // Simple validation to check if the language might be real
      // You could enhance this with a proper language validation API
      if (customLanguage.length < 2) {
        setError('Please enter a valid language name');
        return;
      }
      
      // Convert to lowercase for consistency
      const formattedLanguage = customLanguage.toLowerCase().trim();
      onLanguageSelect(formattedLanguage);
    } catch (error) {
      setError('Invalid language selection');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center gap-2 justify-center mb-4">
            <BookOpen className="h-8 w-8" />
            Quick Vocab
          </CardTitle>
          <CardDescription className="text-lg">
            Choose your preferred language for learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Popular Languages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {languages.map((lang) => (
              <Button
                key={lang.id}
                variant="outline"
                className="h-auto py-8 flex flex-col items-center gap-4 hover:bg-accent hover:scale-105 transition-all duration-200"
                onClick={() => onLanguageSelect(lang.id)}
              >
                <span className="text-5xl mb-2">{lang.flag}</span>
                <div className="text-center space-y-2">
                  <span className="text-xl font-semibold block">{lang.name}</span>
                  <span className="text-sm text-muted-foreground block px-4">
                    {lang.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom Language Input */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-center mb-4">
              Don't see your language? Enter it below:
            </h3>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Enter language name..."
                value={customLanguage}
                onChange={(e) => {
                  setCustomLanguage(e.target.value);
                  setError(null);
                }}
                className="flex-grow"
              />
              <Button 
                onClick={handleCustomLanguageSubmit}
                className="flex-shrink-0"
              >
                <Search className="h-4 w-4 mr-2" />
                Select
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 