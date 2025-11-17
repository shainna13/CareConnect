"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/app/src/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";

interface AccountData {
  name: string;
  email: string;
  specialty?: string;
  type: string;
  [key: string]: any;
}

interface UserContextType {
  currentUser: User | null;
  accountData: AccountData | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  accountData: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Query accounts collection where email == user.email
          const q = query(collection(db, "accounts"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming one document per user
            const docData = querySnapshot.docs[0].data() as AccountData;
            setAccountData({...docData, id: querySnapshot.docs[0].id});
          } else {
            setAccountData(null);
          }
        } catch (error) {
          console.error("Error fetching account data:", error);
          setAccountData(null);
        }
      } else {
        setAccountData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, accountData, loading }}>
      {children}
    </UserContext.Provider>
  );
};
