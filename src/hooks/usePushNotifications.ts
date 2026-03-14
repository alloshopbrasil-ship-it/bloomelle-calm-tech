import { useState, useEffect, useCallback } from "react";

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return;

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }, [isSupported, permission]);

  const scheduleReminder = useCallback((title: string, body: string, delayMs: number) => {
    if (!isSupported || permission !== "granted") return null;

    const timeoutId = setTimeout(() => {
      sendNotification(title, { body });
    }, delayMs);

    return timeoutId;
  }, [isSupported, permission, sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder
  };
};
