import React, { useState, useEffect } from 'react';







import Login from './components/Login';







import Signup from './components/Signup';







import QuickVocab from './components/ChatInterface';







import { account } from './lib/appwrite';







import { ID } from 'appwrite';















export default function App() {







  const [isLoggedIn, setIsLoggedIn] = useState(false);







  const [isLoading, setIsLoading] = useState(true);







  const [showSignup, setShowSignup] = useState(false);







  const [userInfo, setUserInfo] = useState<any>(null);















  useEffect(() => {







    checkAuthStatus();







  }, []);















  const checkAuthStatus = async () => {







    try {







      const session = await account.getSession('current');







      const user = await account.get();







      setUserInfo(user);







      setIsLoggedIn(true);







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







    } catch (error: any) {







      console.error('Login error:', error);







      throw new Error(error.message);







    }







  };















  const handleSignup = async (email: string, password: string, name: string) => {







    try {







      await account.create(ID.unique(), email, password, name);







      await handleLogin(email, password);







    } catch (error: any) {







      console.error('Signup error:', error);







      throw new Error(error.message);







    }







  };















  const handleGoogleLogin = async () => {







    try {







      account.createOAuth2Session(







        'google',







        'http://localhost:5173/quick-vocab/',







        'http://localhost:5173/quick-vocab/',







      );







    } catch (error: any) {







      console.error('Google login error:', error);







      throw new Error(error.message);







    }







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















  return <QuickVocab userInfo={userInfo} />;







}






