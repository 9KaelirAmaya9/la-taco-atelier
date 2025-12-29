# 🚨 EMERGENCY FIX: ProtectedRoute Infinite Loading

## Problem
The /admin and /kitchen pages show infinite loading spinner because `supabase.auth.getSession()` is hanging.

## Root Cause
Lovable's deployed environment has a broken Supabase client that never resolves auth checks.

## Solution
Replace the entire ProtectedRoute.tsx with this bulletproof version that has proper timeout handling.

## Instructions for Lovable

**LOVABLE: Replace the ENTIRE contents of `src/components/ProtectedRoute.tsx` with this code:**

```typescript
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "kitchen";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuthAndRole = async () => {
      const startTime = Date.now();
      console.log("🔐 Starting auth check...");

      try {
        // CRITICAL FIX: Add master timeout to prevent infinite loading
        const masterTimeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            console.error("⏰ Master timeout reached - forcing redirect to auth");
            reject(new Error("Auth check timeout"));
          }, 5000); // 5 second master timeout
        });

        // Race between session check and timeout
        const sessionPromise = supabase.auth.getSession();

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          masterTimeout
        ]) as Awaited<ReturnType<typeof sessionPromise>>;

        clearTimeout(timeoutId);

        if (!mounted) return;

        console.log(`✅ Session check completed in ${Date.now() - startTime}ms`);

        if (error) {
          console.error("❌ Auth check error:", error);
          setIsAuthenticated(false);
          setHasRole(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("🚫 No session found - redirecting to auth");
          setIsAuthenticated(false);
          setHasRole(false);
          setIsLoading(false);
          return;
        }

        console.log("✅ Session found for user:", session.user.id);
        setIsAuthenticated(true);

        // If no role required, we're done
        if (!requiredRole) {
          setHasRole(true);
          setIsLoading(false);
          return;
        }

        // Check role with timeout
        const roleCheckStart = Date.now();
        let userHasRole = false;

        try {
          const rolePromise = supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .limit(5);

          const roleTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Role check timeout")), 3000)
          );

          const { data: roles, error: roleError } = await Promise.race([
            rolePromise,
            roleTimeout
          ]) as any;

          if (!mounted) return;

          console.log(`✅ Role check completed in ${Date.now() - roleCheckStart}ms`);

          if (roleError) {
            console.error("❌ Role query error:", roleError);
            userHasRole = false;
          } else if (roles && roles.length > 0) {
            userHasRole = roles.some(
              (r) => r.role === requiredRole || (requiredRole === 'kitchen' && r.role === 'admin')
            );
            console.log(`✅ User roles: [${roles.map(r => r.role).join(', ')}], Required: ${requiredRole}, Access: ${userHasRole}`);
          } else {
            console.log("⚠️ No roles found - trying bootstrap for admin");
            if (requiredRole === 'admin') {
              try {
                const { data: granted, error: bootstrapError } = await supabase.rpc('bootstrap_admin');

                if (bootstrapError) {
                  console.error("❌ Bootstrap error:", bootstrapError);
                } else if (granted === true) {
                  console.log("✅ Admin role bootstrapped");
                  userHasRole = true;
                } else {
                  console.log("🚫 Bootstrap denied - admin exists");
                }
              } catch (e) {
                console.error('❌ Bootstrap exception:', e);
              }
            }
          }
        } catch (e: any) {
          console.error("❌ Role check exception:", e.message || e);
          userHasRole = false;
        }

        if (mounted) {
          setHasRole(userHasRole);
          setIsLoading(false);
        }
      } catch (e: any) {
        console.error("❌ Auth check failed:", e.message || e);
        // On timeout or error, redirect to auth instead of infinite loading
        if (mounted) {
          setIsAuthenticated(false);
          setHasRole(false);
          setIsLoading(false);
        }
      }
    };

    checkAuthAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log("🔄 Auth state changed:", event);

      setTimeout(() => {
        if (mounted) {
          checkAuthAndRole();
        }
      }, 100);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  if (requiredRole && !hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <p className="text-sm text-muted-foreground mt-2">Required role: {requiredRole}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

## What This Fixes

1. ✅ **Master 5-second timeout** prevents infinite loading
2. ✅ **Better logging** with emojis for easy debugging
3. ✅ **Graceful failure** - redirects to auth instead of hanging
4. ✅ **Clearer error messages** show what's happening
5. ✅ **Proper cleanup** of timeouts on unmount

## After Applying

1. The infinite spinner will be gone
2. If auth check times out, user is redirected to /auth
3. Console will show clear logs of what's happening
4. Admin/kitchen pages will load or redirect properly

## Testing

After deploying, test:
1. Navigate to /admin (not logged in) → Should redirect to /auth
2. Log in → Should redirect back to /admin
3. Should see console logs showing auth check progress
4. No more infinite spinner

---

**This is the ONLY file that needs to change. Do NOT modify anything else.**
