import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { BookOpen, Eye, EyeOff } from 'lucide-react';



interface SignupProps {

  onSignup: (email: string, password: string, name: string) => Promise<void>;

  onSwitchToLogin: () => void;

  isDisabled: boolean;

}



export default function Signup({ onSignup, onSwitchToLogin, isDisabled }: SignupProps) {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [name, setName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);



  // Password validation rules

  const hasMinLength = password.length >= 8;

  const hasUpperCase = /[A-Z]/.test(password);

  const hasLowerCase = /[a-z]/.test(password);

  const hasNumber = /\d/.test(password);

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);



  const validateInputs = () => {

    // Name validation

    if (name.trim().length < 2) {

      setError("Name must be at least 2 characters long");

      return false;

    }



    // Email validation

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {

      setError("Please enter a valid email address");

      return false;

    }



    // Password validation

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {

      setError("Password does not meet all requirements");

      return false;

    }



    return true;

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError(null);



    if (!validateInputs()) {

      return;

    }



    setIsLoading(true);



    try {

      await onSignup(email, password, name);

    } catch (err: any) {

      setError(err.message || 'Signup failed');

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

            Create an account to start learning

          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">

              <Input

                type="text"

                placeholder="Full Name"

                value={name}

                onChange={(e) => {

                  setName(e.target.value);

                  setError(null);

                }}

                required

                minLength={2}

                className="w-full"

              />

              <p className="text-xs text-muted-foreground">

                Must be at least 2 characters long

              </p>

            </div>



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

                className="w-full"

              />

              <p className="text-xs text-muted-foreground">

                Enter a valid email address

              </p>

            </div>



            <div className="space-y-2">

              <div className="relative">

                <Input

                  type={showPassword ? "text" : "password"}

                  placeholder="Password"

                  value={password}

                  onChange={(e) => {

                    setPassword(e.target.value);

                    setError(null);

                  }}

                  required

                  className="w-full pr-10"

                />

                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

                  className="absolute right-3 top-1/2 -translate-y-1/2"

                >

                  {showPassword ? (

                    <EyeOff className="h-4 w-4 text-gray-500" />

                  ) : (

                    <Eye className="h-4 w-4 text-gray-500" />

                  )}

                </button>

              </div>

              

              <div className="space-y-1 text-sm">

                <p className={hasMinLength ? "text-green-500" : "text-gray-500"}>

                  ✓ At least 8 characters

                </p>

                <p className={hasUpperCase ? "text-green-500" : "text-gray-500"}>

                  ✓ One uppercase letter (A-Z)

                </p>

                <p className={hasLowerCase ? "text-green-500" : "text-gray-500"}>

                  ✓ One lowercase letter (a-z)

                </p>

                <p className={hasNumber ? "text-green-500" : "text-gray-500"}>

                  ✓ One number (0-9)

                </p>

                <p className={hasSpecialChar ? "text-green-500" : "text-gray-500"}>

                  ✓ One special character (!@#$%^&*)

                </p>

              </div>

            </div>



            {error && (

              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">

                {error}

              </div>

            )}



            <Button

              type="submit"

              className="w-full"

              disabled={isDisabled}

            >

              {isLoading ? (

                <div className="flex items-center justify-center">

                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>

                  Creating Account...

                </div>

              ) : (

                'Create Account'

              )}

            </Button>

          </form>

        </CardContent>

        <CardFooter className="flex flex-col gap-2">

          <div className="text-sm text-center">

            Already have an account?{' '}

            <Button variant="link" onClick={onSwitchToLogin} className="p-0">

              Sign in

            </Button>

          </div>

        </CardFooter>

      </Card>

    </div>

  );

} 
