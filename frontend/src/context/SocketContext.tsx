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

    const newSocket = io(BACKEND_URL,{
        autoConnect:true,
    });

    //register after user is authenticated
    newSocket.emit("register", { userId: user.id });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
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