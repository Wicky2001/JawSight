import {createContext,useContext,useEffect,useState} from 'react';
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';


const SocketContext = createContext<Socket | null>(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  const {user,isAuthenticated} = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null); 
  
  useEffect(()=>{
    if(!isAuthenticated || !user) return;   

    debugger;

    const socket = io(BACKEND_URL,{
        autoConnect:true,
        withCredentials:true,
    });


    setSocket(socket);
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    //disconnect socket on unmount or when user logs out
    socket.on("disconnect", (reason) => {
      console.log("Disconnected from Socket.IO server. Reason:", reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated,user]);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );

};


export const useSocket = ()=>{ 
    return useContext(SocketContext)!;
}