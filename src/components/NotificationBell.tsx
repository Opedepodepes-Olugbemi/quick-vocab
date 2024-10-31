import { Bell, BellOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { NotificationService } from '@/lib/notifications';

import { useState, useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';



export function NotificationBell() {

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const { toast } = useToast();



  useEffect(() => {

    if ("Notification" in window) {

      const checkPermission = async () => {

        const permission = await NotificationService.checkPermission();

        setNotificationsEnabled(permission === "granted");

      };

      checkPermission();

    }

  }, []);



  const handleToggleNotifications = async () => {

    try {

      const result = await NotificationService.requestPermission();

      setNotificationsEnabled(result);

      if (result) {

        toast({

          title: "Notifications Enabled",

          description: "You will receive vocabulary reminders",

          variant: "default"

        });

        await NotificationService.sendVocabularyNotification(

          "Welcome",

          "Notifications are now enabled!",

          "System"

        );

      } else {

        toast({

          title: "Notifications Disabled",

          description: "Please enable notifications in your browser settings",

          variant: "destructive"

        });

      }

    } catch (error) {

      console.error('Error toggling notifications:', error);

      toast({

        title: "Error",

        description: "Failed to enable notifications. Please check your browser settings.",

        variant: "destructive"

      });

    }

  };



  return (

    <Button

      variant="ghost"

      size="icon"

      onClick={handleToggleNotifications}

      title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}

    >

      {notificationsEnabled ? (

        <Bell className="h-4 w-4" />

      ) : (

        <BellOff className="h-4 w-4" />

      )}

    </Button>

  );

} 
