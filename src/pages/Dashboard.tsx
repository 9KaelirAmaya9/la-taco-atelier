import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ClipboardList, UserCircle, LogOut, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);

        // Fetch user roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roles) {
          setUserRoles(roles.map(r => r.role));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRoles();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAdminRole = userRoles.includes("admin");
  const hasKitchenRole = userRoles.includes("kitchen");

  return (
    <div className="min-h-screen bg-background pattern-tile">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* Admin Card */}
          {hasAdminRole && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => navigate("/admin")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>
                  Manage orders, view analytics, and control user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Open Admin
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Kitchen Card */}
          {hasKitchenRole && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent" onClick={() => navigate("/kitchen")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <ChefHat className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Kitchen Display</CardTitle>
                <CardDescription>
                  View and manage incoming orders in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Open Kitchen
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary" onClick={() => navigate("/profile")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <UserCircle className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                View your account details and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* No Roles Message */}
        {!hasAdminRole && !hasKitchenRole && (
          <div className="mt-8 text-center">
            <Card className="max-w-md mx-auto border-muted">
              <CardHeader>
                <CardTitle>No Dashboard Access</CardTitle>
                <CardDescription>
                  You don't have admin or kitchen roles assigned yet. Please contact an administrator for access.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
