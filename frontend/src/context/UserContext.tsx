import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type UserContextType = {
  user: string;
  setUser: React.Dispatch<React.SetStateAction<string>>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }:Props) => {
  const [user, setUser] = useState("Wicky");

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook (optional but clean)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};