import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { BookOpen } from 'lucide-react';



interface LoginProps {

  onLogin: (email: string, password: string) => Promise<void>;

  onGoogleLogin: () => Promise<void>;

  onSwitchToSignup: () => void;

}



export default function Login({ onLogin, onGoogleLogin, onSwitchToSignup }: LoginProps) {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError(null);

    setIsLoading(true);



    try {

      console.log('Attempting login for:', email);

      await onLogin(email, password);

    } catch (err: any) {

      console.error('Login error:', err);

      setError(err.message || 'Login failed');

    } finally {

      setIsLoading(false);

    }

  };



  return (

    <div className="container mx-auto p-4 max-w-md h-screen flex items-center justify-center">

      <Card className="w-full">

        <CardHeader>

          <CardTitle className="text-2xl font-bold flex items-center gap-2 justify-center">

            <BookOpen className="h-6 w-6" />

            Quick Vocab

          </CardTitle>

          <CardDescription className="text-center">

            Sign in to access your vocabulary learning assistant

          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">

              <Input

                type="email"

                placeholder="Email"

                value={email}

                onChange={(e) => {

                  setEmail(e.target.value);

                  setError(null);

                }}

                required

              />

            </div>

            <div className="space-y-2">

              <Input

                type="password"

                placeholder="Password"

                value={password}

                onChange={(e) => {

                  setPassword(e.target.value);

                  setError(null);

                }}

                required

              />

            </div>

            {error && (

              <div className="text-red-500 text-sm text-center">

                {error}

              </div>

            )}

            <Button

              type="submit"

              className="w-full"

              disabled={isLoading}

            >

              {isLoading ? 'Signing in...' : 'Sign in'}

            </Button>

          </form>

        </CardContent>

        <CardFooter className="flex flex-col gap-4">

          <div className="text-sm text-center">

            Don't have an account?{' '}

            <Button variant="link" onClick={onSwitchToSignup} className="p-0">

              Sign up

            </Button>

          </div>

          <div className="relative w-full">

            <div className="absolute inset-0 flex items-center">

              <span className="w-full border-t" />

            </div>

            <div className="relative flex justify-center text-xs uppercase">

              <span className="bg-background px-2 text-muted-foreground">

                Or continue with

              </span>

            </div>

          </div>

          <Button

            type="button"

            variant="outline"

            className="w-full"

            onClick={onGoogleLogin}

            disabled={isLoading}

          >

            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">

              <path

                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"

                fill="#4285F4"

              />

              <path

                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"

                fill="#34A853"

              />

              <path

                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"

                fill="#FBBC05"

              />

              <path

                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"

                fill="#EA4335"

              />

            </svg>

            Sign in with Google

          </Button>

        </CardFooter>

      </Card>

    </div>

  );

} 
