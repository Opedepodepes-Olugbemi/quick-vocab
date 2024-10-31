import { BookOpen } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-8 w-8 animate-pulse text-primary" />
        <h1 className="text-2xl font-bold">Quick Vocab</h1>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
} 