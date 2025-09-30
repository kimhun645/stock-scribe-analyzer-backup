import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { userService, User } from '@/lib/userService';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      if (user) {
        setFirebaseUser(user);
        try {
          const userData = await userService.getUserById(user.uid);
          console.log('User data loaded:', userData);
          setCurrentUser(userData);
        } catch (error) {
          console.log('User not found in Firestore, creating new user document...');
          try {
            const newUser: User = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้ใหม่',
              role: 'user',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };

            await userService.createUserDocument(newUser);
            setCurrentUser(newUser);
            console.log('User document created successfully');
          } catch (createError) {
            console.error('Error creating user document:', createError);
            const fallbackUser: User = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้ใหม่',
              role: 'user',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            setCurrentUser(fallbackUser);
          }
        }
      } else {
        console.log('User logged out');
        setCurrentUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const userData = await userService.getUserById(uid);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in:', email);
      const user = await userService.signIn(email, password);
      console.log('Sign in successful:', user);
      setCurrentUser(user);
      setFirebaseUser(await userService.getCurrentUser());
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await userService.signOut();
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return userService.hasPermission(currentUser.role, permission);
  };

  const hasRole = (role: string): boolean => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser.uid);
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    isLoading,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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