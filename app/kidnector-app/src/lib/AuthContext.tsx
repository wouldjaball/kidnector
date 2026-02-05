import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getFamily, getChildren } from './supabase';
import { Family, Child } from './database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  family: Family | null;
  children: Child[];
  isLoading: boolean;
  refreshFamily: () => Promise<void>;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: childrenProp }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData();
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData();
        } else {
          setFamily(null);
          setChildrenList([]);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData() {
    try {
      const [familyData, childrenData] = await Promise.all([
        getFamily(),
        getChildren(),
      ]);
      setFamily(familyData);
      setChildrenList(childrenData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshFamily() {
    const familyData = await getFamily();
    setFamily(familyData);
  }

  async function refreshChildren() {
    const childrenData = await getChildren();
    setChildrenList(childrenData);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        family,
        children: childrenList,
        isLoading,
        refreshFamily,
        refreshChildren,
      }}
    >
      {childrenProp}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
