import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import QuickVocab from './components/ChatInterface';
import { account, createUserDocument } from './lib/appwrite';
import { ID, AppwriteException } from 'appwrite';
import LanguageSelection from './components/LanguageSelection';
import { LoadingScreen } from './components/LoadingScreen';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await account.getSession('current');
      const user = await account.get();
      setUserInfo(user);
      setIsLoggedIn(true);
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        setShowOnboarding(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await account.createEmailSession(email, password);
      const user = await account.get();
      setUserInfo(user);
      setIsLoggedIn(true);
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message
      });
      throw error;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRateLimited) {
      timer = setTimeout(() => {
        setIsRateLimited(false);
      }, 30000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRateLimited]);

  const handleRateLimit = () => {
    setIsRateLimited(true);
    toast({
      variant: "destructive",
      title: "Rate Limit Exceeded",
      description: "Please wait 30 seconds before trying again."
    });
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    if (isRateLimited) {
      toast({
        variant: "destructive",
        title: "Please Wait",
        description: "Please wait before trying again."
      });
      return;
    }

    setIsLoading(true);
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      console.log('Account created:', newAccount);

      try {
        await createUserDocument(newAccount.$id, email, name);
        console.log('User document created successfully');
      } catch (docError) {
        console.error('Failed to create user document:', docError);
      }

      await handleLogin(email, password);
      setShowOnboarding(true);
      toast({
        title: "Success",
        description: "Account created successfully!"
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 429:
            handleRateLimit();
            break;
          case 400:
            toast({
              variant: "destructive",
              title: "Invalid Input",
              description: "Please check your email and password format."
            });
            break;
          case 409:
            toast({
              variant: "destructive",
              title: "Account Exists",
              description: "An account with this email already exists."
            });
            break;
          default:
            toast({
              variant: "destructive",
              title: "Signup Failed",
              description: error.message
            });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred"
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/quick-vocab/`;

      await account.createOAuth2Session(
        'google',
        redirectUrl,
        redirectUrl
      );
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message
      });
      throw error;
    }
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowOnboarding(false);
    localStorage.setItem('preferredLanguage', language);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  useEffect(() => {
    const handleRedirect = async () => {
      const isRedirect = localStorage.getItem('loginRedirect');
      if (isRedirect) {
        try {
          const session = await account.getSession('current');
          if (session) {
            const user = await account.get();
            setUserInfo(user);
            setIsLoggedIn(true);
            localStorage.removeItem('loginRedirect');
          }
        } catch (error) {
          console.error('Redirect error:', error);
        }
      }
    };

    handleRedirect();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!isLoggedIn ? (
        showSignup ? (
          <Signup 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setShowSignup(false)}
            isDisabled={isRateLimited || isLoading}
          />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onGoogleLogin={handleGoogleLogin} 
            onSwitchToSignup={() => setShowSignup(true)} 
          />
        )
      ) : showOnboarding ? (
        <LanguageSelection onLanguageSelect={handleLanguageSelect} />
      ) : (
        <QuickVocab 
          userInfo={userInfo} 
          selectedLanguage={selectedLanguage} 
          onLanguageChange={handleLanguageChange}
        />
      )}
      <Toaster />
    </>
  );
}






