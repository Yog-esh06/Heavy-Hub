import React, { createContext, useCallback, useState } from "react";
import { TOAST_DURATION_MS } from "../shared/constants";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = "info", duration = TOAST_DURATION_MS) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => removeNotification(id), duration);
      }

      return id;
    },
    [removeNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess: (message, duration) => addNotification(message, "success", duration),
    showError: (message, duration) => addNotification(message, "error", duration),
    showWarning: (message, duration) => addNotification(message, "warning", duration),
    showInfo: (message, duration) => addNotification(message, "info", duration),
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
