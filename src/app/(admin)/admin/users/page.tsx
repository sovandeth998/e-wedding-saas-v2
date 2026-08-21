"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Shield, ShieldOff, Users, UserCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserRow | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const toggleAdmin = async (user: UserRow) => {
    if (user.id === currentUser?.id) return;
    setUpdating(user.id);

    const newRole = user.role === "admin" ? "client" : "admin";
    await supabase.from("users").update({ role: newRole }).eq("id", user.id);

    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    setConfirmUser(null);
    setUpdating(null);
    if (newRole === "admin") {
      toast.success("បានបន្ថែម Admin!");
    } else {
      toast.success("បានដក Admin!");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const clientCount = users.filter((u) => u.role !== "admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងអ្នកប្រើប្រាស់</h1>
        <p className="text-muted-foreground">អ្នកប្រើប្រាស់សរុប {users.length} នាក់</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold-50 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-secondary">{users.length}</p><p className="text-xs text-muted-foreground">សរុប</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold-50 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-secondary">{adminCount}</p><p className="text-xs text-muted-foreground">Admin</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold-50 flex items-center justify-center"><UserCheck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-secondary">{clientCount}</p><p className="text-xs text-muted-foreground">Client</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="ស្វែងរកអ្នកប្រើប្រាស់..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-gold-200" />
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-200/50 bg-gold-50/50">
                    <th className="text-left p-3 text-sm font-medium text-secondary">អ្នកប្រើប្រាស់</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">អ៊ីមែល</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">តួនាទី</th>
                    <th className="text-left p-3 text-sm font-medium text-secondary">ថ្ងៃចូលរួម</th>
                    <th className="text-right p-3 text-sm font-medium text-secondary">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-medium text-white">
                            {u.full_name?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-secondary">{u.full_name || "មិនមាន"}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className={u.role === "admin" ? "bg-gold-gradient text-white border-0" : ""}>
                          {u.role === "admin" ? "Admin" : "Client"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("km-KH")}
                      </td>
                      <td className="p-3 text-right">
                        {u.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant={u.role === "admin" ? "destructive" : "default"}
                            className={u.role === "admin" ? "" : "bg-gold-gradient text-white hover:opacity-90"}
                            disabled={updating === u.id}
                            onClick={() => setConfirmUser(u)}
                          >
                            {updating === u.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                            ) : u.role === "admin" ? (
                              <><ShieldOff className="h-3 w-3 mr-1" /> ដក Admin</>
                            ) : (
                              <><Shield className="h-3 w-3 mr-1" /> ដាក់ Admin</>
                            )}
                          </Button>
                        )}
                        {u.id === currentUser?.id && (
                          <Badge className="bg-gold-50 text-primary border border-gold-200">អ្នក</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4 border-0 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">
                    {confirmUser.role === "admin" ? "ដក Admin?" : "ដាក់ Admin?"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{confirmUser.email}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {confirmUser.role === "admin"
                  ? `តើអ្នកប្រាកដទេថាចង់ដក ${confirmUser.email} ពី Admin?`
                  : `តើអ្នកប្រាកដទេថាចង់ដាក់ ${confirmUser.email} ជា Admin?`}
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="border-gold-200" onClick={() => setConfirmUser(null)}>បោះបង់</Button>
                <Button
                  variant={confirmUser.role === "admin" ? "destructive" : "default"}
                  className={confirmUser.role === "admin" ? "" : "bg-gold-gradient text-white"}
                  onClick={() => toggleAdmin(confirmUser)}
                >
                  បញ្ជាក់
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
