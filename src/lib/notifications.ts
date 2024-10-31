export class NotificationService {
    static async checkPermission(): Promise<NotificationPermission> {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return "denied";
      }
      return Notification.permission;
    }
  
    static async requestPermission(): Promise<boolean> {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
      }
  
      try {
        if (Notification.permission === "granted") {
          console.log("Notifications already permitted");
          return true;
        }
  
        const permission = await Notification.requestPermission();
        console.log("Notification permission result:", permission);
  
        if (permission === "granted") {
          await this.sendVocabularyNotification(
            "Welcome",
            "Notifications are now enabled!",
            "System"
          );
        }
  
        return permission === "granted";
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    }
  
    static async sendVocabularyNotification(
      word: string,
      meaning: string,
      language: string
    ): Promise<boolean> {
      try {
        if (Notification.permission !== "granted") {
          console.log("Notifications not permitted");
          return false;
        }
  
        if (!word || !meaning) {
          console.log("Invalid vocabulary data:", { word, meaning });
          return false;
        }
  
        console.log(`Creating notification for: ${word} - ${meaning}`);
  
        const notificationBody = `Word: ${word}\nMeaning: ${meaning}`;
        const notificationData = {
          word,
          meaning,
          language,
          timestamp: new Date().toISOString()
        };
  
        const notification = new Notification(`New ${language} Vocabulary!`, {
          body: notificationBody,
          icon: "/quick-vocab/favicon.ico",
          tag: `vocab-${word}`,
          requireInteraction: true,
          data: notificationData,
          silent: false
        } as NotificationOptions);
  
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          localStorage.setItem('lastClickedVocab', JSON.stringify(notificationData));
          
          window.dispatchEvent(
            new CustomEvent('vocabularyNotificationClicked', {
              detail: notificationData
            })
          );
        };
  
        this.addToHistory(notificationData);
        console.log('Notification sent successfully');
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    }
  
    static async scheduleVocabularyReminder(
      vocabularies: Array<{ word: string; meaning: string }>,
      language: string
    ): Promise<void> {
      if (!vocabularies.length) {
        console.log('No vocabularies to schedule');
        return;
      }
  
      console.log(`Scheduling ${vocabularies.length} notifications for ${language}`);
  
      // Calculate timing for two notifications within 15 minutes
      const firstNotificationDelay = 7 * 60 * 1000; // 7 minutes
      const secondNotificationDelay = 14 * 60 * 1000; // 14 minutes
  
      // Schedule first notification
      setTimeout(() => {
        const randomVocab = vocabularies[Math.floor(Math.random() * vocabularies.length)];
        this.sendVocabularyNotification(
          randomVocab.word,
          randomVocab.meaning,
          language
        );
      }, firstNotificationDelay);
  
      // Schedule second notification
      setTimeout(() => {
        const remainingVocabs = vocabularies.filter(v => v.word !== vocabularies[0].word);
        if (remainingVocabs.length > 0) {
          const randomVocab = remainingVocabs[Math.floor(Math.random() * remainingVocabs.length)];
          this.sendVocabularyNotification(
            randomVocab.word,
            randomVocab.meaning,
            language
          );
        }
      }, secondNotificationDelay);
    }
  
    private static addToHistory(data: {
      word: string;
      meaning: string;
      language: string;
      timestamp: string;
    }): void {
      try {
        const history = JSON.parse(
          localStorage.getItem('vocabularyNotifications') || '[]'
        );
        history.push(data);
        localStorage.setItem(
          'vocabularyNotifications',
          JSON.stringify(history.slice(-50))
        );
      } catch (error) {
        console.error('Error saving to notification history:', error);
      }
    }
  }