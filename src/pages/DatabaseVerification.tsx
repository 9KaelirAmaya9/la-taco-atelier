import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Database, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface TableCheck {
  name: string;
  exists: boolean;
  count?: number;
  error?: string;
}

export default function DatabaseVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<TableCheck[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");

  const tablesToCheck = [
    "orders",
    "profiles",
    "user_roles",
    "admin_users",
    "cart_items",
    "delivery_zones",
    "order_notes",
    "push_subscriptions",
  ] as const;

  const checkDatabase = async () => {
    setLoading(true);
    setConnectionStatus("checking");

    try {
      // Test basic connection
      const { error: connectionError } = await supabase.from("orders").select("id").limit(1);
      
      if (connectionError) {
        setConnectionStatus("error");
        console.error("Connection error:", connectionError);
      } else {
        setConnectionStatus("connected");
      }

      // Check each table
      const results: TableCheck[] = [];
      
      for (const tableName of tablesToCheck) {
        try {
          // Use type assertion for dynamic table access
          const { count, error } = await (supabase
            .from(tableName as keyof typeof supabase extends never ? string : typeof tableName)
            .select("*", { count: "exact", head: true }) as any);

          if (error) {
            results.push({
              name: tableName,
              exists: false,
              error: error.message,
            });
          } else {
            results.push({
              name: tableName,
              exists: true,
              count: count || 0,
            });
          }
        } catch (e: any) {
          results.push({
            name: tableName,
            exists: false,
            error: e.message,
          });
        }
      }

      setTables(results);
    } catch (error) {
      console.error("Database check failed:", error);
      setConnectionStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const successCount = tables.filter((t) => t.exists).length;
  const failCount = tables.filter((t) => !t.exists).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Database Verification</h1>
          <p className="text-muted-foreground mt-2">
            Check database connection and table status
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {connectionStatus === "checking" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span>Checking connection...</span>
                </>
              )}
              {connectionStatus === "connected" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">Connected to database</span>
                </>
              )}
              {connectionStatus === "error" && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">Connection failed</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{tables.length}</div>
                <p className="text-sm text-muted-foreground">Tables Checked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{successCount}</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{failCount}</div>
                <p className="text-sm text-muted-foreground">Issues</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Table Status</CardTitle>
              <CardDescription>Individual table availability and record counts</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkDatabase}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {table.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-mono text-sm">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.exists ? (
                        <Badge variant="secondary">
                          {table.count} records
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {table.error || "Not found"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {failCount > 0 && (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Some tables are not accessible. This may indicate missing migrations or permission issues.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}