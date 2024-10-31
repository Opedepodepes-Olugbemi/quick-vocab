import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import QuickVocab from './components/ChatInterface';
import { account } from './lib/appwrite';
import { ID } from 'appwrite';
import LanguageSelection from './components/LanguageSelection';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

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
      throw new Error(error.message);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await handleLogin(email, password);
      setShowOnboarding(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get the current URL's origin
      const origin = window.location.origin;
      const redirectUrl = `${origin}/quick-vocab/`;

      account.createOAuth2Session(
        'google',
        redirectUrl, // Success URL
        redirectUrl  // Failure URL
      );
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup 
          onSignup={handleSignup} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onGoogleLogin={handleGoogleLogin} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  if (isLoggedIn && showOnboarding) {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  if (isLoggedIn) {
    return (
      <QuickVocab 
        userInfo={userInfo} 
        selectedLanguage={selectedLanguage} 
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return <div>Something went wrong...</div>;
}






