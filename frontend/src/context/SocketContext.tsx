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

    const socket = io(BACKEND_URL,{
        autoConnect:true,
        withCredentials:true,
    });


    setSocket(socket);

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