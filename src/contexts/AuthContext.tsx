import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  hasRole: (role: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const initialized = useRef(false);

  const fetchRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("AuthContext: Error fetching roles", error);
        return [];
      }

      return data?.map((r) => r.role) || [];
    } catch (e) {
      console.error("AuthContext: Exception fetching roles", e);
      return [];
    }
  };

  const initializeAuth = async () => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("AuthContext: Error getting session", error);
        setLoading(false);
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userRoles = await fetchRoles(currentSession.user.id);
        setRoles(userRoles);
        console.log("AuthContext: User authenticated", currentSession.user.id, "Roles:", userRoles);
      } else {
        setSession(null);
        setUser(null);
        setRoles([]);
        console.log("AuthContext: No active session");
      }
    } catch (e) {
      console.error("AuthContext: Exception during initialization", e);
    } finally {
      // ALWAYS set loading to false, even if something fails
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize auth state only once
    initializeAuth();

    // Listen for auth changes - SINGLE listener for entire app
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("AuthContext: Auth state changed", event, newSession ? "has session" : "no session");

      // Don't process INITIAL_SESSION - we handle that in initializeAuth
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' && newSession?.user) {
        // Don't set loading back to true - keep user state stable
        setSession(newSession);
        setUser(newSession.user);
        
        // Fetch roles in background without blocking
        fetchRoles(newSession.user.id).then(userRoles => {
          setRoles(userRoles);
          console.log("AuthContext: Roles updated", userRoles);
        }).catch(err => {
          console.error("AuthContext: Failed to fetch roles", err);
          setRoles([]); // Set empty array on error
        });
        
        setLoading(false);
        console.log("AuthContext: User signed in", newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Only clear state if we don't have a valid session anymore
        // This prevents clearing state during token refresh
        if (!newSession) {
          setSession(null);
          setUser(null);
          setRoles([]);
          setLoading(false);
          console.log("AuthContext: User signed out completely");
        }
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        // Update session with refreshed token
        setSession(newSession);
        if (newSession.user) {
          setUser(newSession.user);
        }
        console.log("AuthContext: Token refreshed successfully");
      } else if (event === 'USER_UPDATED' && newSession) {
        setSession(newSession);
        if (newSession.user) {
          setUser(newSession.user);
        }
        console.log("AuthContext: User updated");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  const hasRole = (role: string) => {
    return roles.includes(role) || (role === "kitchen" && roles.includes("admin"));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        hasRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
