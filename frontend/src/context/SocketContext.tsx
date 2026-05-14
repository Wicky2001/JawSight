import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Toast } from '../helpers/ui/Toast';

type SocketContextType = {
  socket: Socket | null;
  latestPrediction: any | null;
  clearPrediction: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  latestPrediction: null,
  clearPrediction: () => {},
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null); 
  const [latestPrediction, setLatestPrediction] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated || !user) return;   

    const newSocket = io(BACKEND_URL, {
        autoConnect: true,
        withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    newSocket.on("prediction_complete", (data: any) => {
      console.log("Global Socket received prediction_complete:", data);
      setLatestPrediction(data);
      if (data.status === 'success') {
        setToastMsg('Prediction completed successfully!');
      } else {
        setToastMsg(data.message || 'An error occurred during prediction.');
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from Socket.IO server. Reason:", reason);
    });

    return () => {
      debugger;
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const clearPrediction = useCallback(() => {
    setLatestPrediction(null);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, latestPrediction, clearPrediction }}>
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => { 
    return useContext(SocketContext);
};