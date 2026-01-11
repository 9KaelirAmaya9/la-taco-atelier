import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading, hasRole } = useAuth();

  const redirectPath = useMemo(() => {
    const stateRedirect = (location.state as any)?.redirect as string | undefined;
    const queryRedirect = searchParams.get("redirect") || undefined;
    const candidate = stateRedirect || queryRedirect;

    // Prevent open-redirects: only allow in-app paths.
    if (candidate && candidate.startsWith("/")) return candidate;
    return "/dashboard";
  }, [location.state, searchParams]);

  useEffect(() => {
    // Check URL hash for recovery token (Supabase uses hash fragments)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type") || searchParams.get("type");
    const isRecovery = type === "recovery";

    // If URL indicates recovery, show loading state immediately
    if (isRecovery) {
      setIsPasswordReset(true);
      // Wait a moment for auth context to pick up the session
      setTimeout(() => {
        if (user) {
          setSessionReady(true);
        }
      }, 1000);
    }
  }, [searchParams, user]);

  // Redirect if already authenticated
  useEffect(() => {
    // Don't redirect if we're still loading or in password reset flow
    if (loading || isPasswordReset) {
      return;
    }

    // Only redirect if we have a valid user
    if (user) {
      console.log("SignIn: Already logged in, redirecting to", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, redirectPath, navigate, isPasswordReset]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        console.log("SignIn: Login successful for user", data.session.user.id);
        toast.success("Signed in successfully!");

        // Small delay to let auth context update
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log("SignIn: Redirecting to", redirectPath);
        navigate(redirectPath, { replace: true });
      }
    } catch (error: any) {
      console.error("SignIn: Error:", error);
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/signin`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.", { duration: 6000 });
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        if (error.message?.includes("Auth session missing") || error.message?.includes("session")) {
          toast.error("Reset link expired. Please request a new password reset link.");
          setIsPasswordReset(false);
          setSessionReady(false);
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          toast.error(error.message || "Failed to update password");
        }
        return;
      }

      toast.success("Password updated successfully!");
      window.history.replaceState(null, '', window.location.pathname);
      navigate(redirectPath);
    } catch (error: any) {
      console.error("Password update exception:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  // Show loading while checking for recovery session
  if (isPasswordReset && !sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navigation />
        <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show password update form for recovery flow
  if (isPasswordReset && sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <Navigation />
        <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />

      <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <LogIn className="h-6 w-6" />
              Sign In
            </CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending email...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
