import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Bootstrap = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const navigate = useNavigate();

    const handleBootstrap = async () => {
        setIsLoading(true);
        setStatus("Checking authentication...");

        try {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                toast.error("You must be signed in to bootstrap admin access");
                setStatus("Error: Not signed in");
                setIsLoading(false);
                return;
            }

            setStatus(`Found user: ${user.email}`);
            console.log("Bootstrap: User ID:", user.id);

            // Check existing roles
            setStatus("Checking existing roles...");
            const { data: existingRoles, error: rolesError } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id);

            if (rolesError) {
                console.error("Bootstrap: Error checking roles:", rolesError);
                setStatus(`Error checking roles: ${rolesError.message}`);
            } else {
                console.log("Bootstrap: Existing roles:", existingRoles);
                setStatus(`Current roles: ${existingRoles?.map(r => r.role).join(", ") || "none"}`);
            }

            // Try bootstrap_admin function
            setStatus("Calling bootstrap_admin function...");
            const { data: bootstrapped, error: bootError } = await supabase.rpc("bootstrap_admin");

            if (bootError) {
                console.error("Bootstrap: RPC error:", bootError);
                setStatus(`Error: ${bootError.message}`);

                // If RPC fails, try direct insert
                setStatus("RPC failed, trying direct insert...");
                const { error: insertError } = await supabase
                    .from("user_roles")
                    .insert({ user_id: user.id, role: "admin" });

                if (insertError) {
                    console.error("Bootstrap: Insert error:", insertError);
                    setStatus(`Insert failed: ${insertError.message}`);
                    toast.error(`Failed to add admin role: ${insertError.message}`);
                    setIsLoading(false);
                    return;
                }

                setStatus("✅ Admin role added via direct insert!");
                toast.success("Admin role granted successfully!");

                setTimeout(() => {
                    navigate("/admin");
                }, 2000);
                return;
            }

            if (bootstrapped) {
                setStatus("✅ Bootstrap successful! You are now an admin.");
                toast.success("Admin access granted!");

                setTimeout(() => {
                    navigate("/admin");
                }, 2000);
            } else {
                setStatus("⚠️ Bootstrap returned false - admin may already exist");
                toast.warning("Could not bootstrap - an admin may already exist");
            }
        } catch (error: any) {
            console.error("Bootstrap: Exception:", error);
            setStatus(`Exception: ${error.message}`);
            toast.error(error.message || "Failed to bootstrap admin");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Bootstrap Admin Access
                    </CardTitle>
                    <CardDescription>
                        Grant yourself admin access to the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This page will grant admin role to your currently signed-in account.
                        You must be signed in first.
                    </p>

                    <Button
                        onClick={handleBootstrap}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Bootstrapping...
                            </>
                        ) : (
                            "Grant Admin Access"
                        )}
                    </Button>

                    {status && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-mono whitespace-pre-wrap">{status}</p>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>This page attempts to:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Call the bootstrap_admin() database function</li>
                            <li>If that fails, directly insert admin role</li>
                            <li>Redirect you to /admin on success</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Bootstrap;
