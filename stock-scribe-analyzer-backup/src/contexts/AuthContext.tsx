import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { auth as apiAuth } from '../lib/apiService';
import { sessionManager } from '../lib/sessionManager';
import { UserRole } from '../lib/rbac';
import { logUserAction, AuditAction } from '../lib/auditLogger';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  isActive: boolean;
  department?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  sessionWarning: boolean;
  timeRemaining: number;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID Token
          const idToken = await firebaseUser.getIdToken();
          console.log('🔐 Firebase ID Token obtained:', idToken.substring(0, 20) + '...');
          
          // Set token in API service
          apiAuth.setFirebaseIdToken(idToken);
          
          // User is signed in
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            role: firebaseUser.email?.includes('admin') ? UserRole.ADMIN : 
                  firebaseUser.email?.includes('manager') ? UserRole.MANAGER : 
                  firebaseUser.email?.includes('staff') ? UserRole.STAFF : UserRole.VIEWER,
            isActive: true,
            createdAt: new Date(),
            lastLoginAt: new Date()
          };
          setUser(userData);
          setIsAuthenticated(true);
          
          // Setup session management
          setupSessionManagement();
        } catch (error) {
          console.error('❌ Error getting Firebase ID Token:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // User is signed out
        apiAuth.setFirebaseIdToken(null);
        setUser(null);
        setIsAuthenticated(false);
        sessionManager.cleanup();
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      sessionManager.cleanup();
    };
  }, []);

  const setupSessionManagement = () => {
    // Setup session manager callbacks
    sessionManager.setCallbacks(
      () => {
        // On warning
        setSessionWarning(true);
        setTimeRemaining(sessionManager.getTimeUntilTimeout());
      },
      () => {
        // On logout
        setSessionWarning(false);
        setTimeRemaining(0);
        logout();
      }
    );

    // Update time remaining every 30 seconds
    const interval = setInterval(() => {
      if (isAuthenticated) {
        const remaining = sessionManager.getTimeUntilTimeout();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setSessionWarning(false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get Firebase ID Token after successful login
      const idToken = await userCredential.user.getIdToken();
      console.log('🔐 Firebase ID Token obtained after login:', idToken.substring(0, 20) + '...');
      
      // Set token in API service
      apiAuth.setFirebaseIdToken(idToken);
      
      // บันทึก audit log
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        role: userCredential.user.email?.includes('admin') ? UserRole.ADMIN : 
              userCredential.user.email?.includes('manager') ? UserRole.MANAGER : 
              userCredential.user.email?.includes('staff') ? UserRole.STAFF : UserRole.VIEWER
      };
      logUserAction(userData, AuditAction.LOGIN);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // บันทึก audit log สำหรับการล็อกอินผิด
      const userData = {
        id: 'unknown',
        email: email,
        role: UserRole.VIEWER
      };
      logUserAction(userData, AuditAction.LOGIN_FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return false;
    }
  };

  const register = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Get Firebase ID Token after successful registration
      const idToken = await userCredential.user.getIdToken();
      console.log('🔐 Firebase ID Token obtained after registration:', idToken.substring(0, 20) + '...');
      
      // Set token in API service
      apiAuth.setFirebaseIdToken(idToken);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // บันทึก audit log
      if (user) {
        logUserAction(user, AuditAction.LOGOUT);
      }
      
      // Clear Firebase ID Token from API service
      apiAuth.setFirebaseIdToken(null);
      
      // Cleanup session manager
      sessionManager.cleanup();
      
      await signOut(auth);
      // Redirect ไปหน้าแรก
      window.location.href = 'https://stock-6e930.web.app/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const extendSession = () => {
    sessionManager.extendSession();
    setSessionWarning(false);
    setTimeRemaining(sessionManager.getTimeUntilTimeout());
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    sessionWarning,
    timeRemaining,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
