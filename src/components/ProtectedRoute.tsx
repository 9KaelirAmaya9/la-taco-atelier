import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "kitchen";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading, hasRole } = useAuth();

  // Only show loading spinner during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirect = location.pathname + location.search;
    console.log("ProtectedRoute: Not authenticated, redirecting to login with redirect:", redirect);

    if (requiredRole === "kitchen") {
      return <Navigate to="/kitchen-login" state={{ redirect }} replace />;
    }

    return <Navigate to="/signin" state={{ redirect }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.log("ProtectedRoute: User authenticated but lacks required role:", requiredRole);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
