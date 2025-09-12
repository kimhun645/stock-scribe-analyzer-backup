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
      if (user) {
        setFirebaseUser(user);
        try {
          // ตรวจสอบว่าผู้ใช้มีข้อมูลใน Firestore หรือไม่
          const userData = await userService.getUserById(user.uid);
          setCurrentUser(userData);
        } catch (error) {
          console.log('User not found in Firestore, creating new user document...');
          // ถ้าไม่มีข้อมูลใน Firestore ให้สร้าง user document ใหม่
          try {
            const newUser: User = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้ใหม่',
              role: 'user', // กำหนดเป็น user เป็นค่าเริ่มต้น
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            
            // สร้าง user document ใน Firestore
            await userService.createUserDocument(newUser);
            setCurrentUser(newUser);
            console.log('User document created successfully');
          } catch (createError) {
            console.error('Error creating user document:', createError);
            // ถ้าสร้างไม่ได้ ให้ใช้ข้อมูลจาก Firebase Auth
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
      const user = await userService.signIn(email, password);
      setCurrentUser(user);
      setFirebaseUser(await userService.getCurrentUser());
    } catch (error) {
      // ถ้า signIn ไม่สำเร็จ ให้ลองใช้ Firebase Auth โดยตรง
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setFirebaseUser(userCredential.user);
        
        // สร้าง user object จาก Firebase Auth
        const fallbackUser: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || 'ผู้ใช้ใหม่',
          role: 'user',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        setCurrentUser(fallbackUser);
      } catch (fallbackError) {
        throw error; // throw original error
      }
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