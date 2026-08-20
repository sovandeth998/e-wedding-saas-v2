"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">គ្រប់គ្រងអ្នកប្រើប្រាស់</h1>
          <p className="text-muted-foreground">អ្នកប្រើប្រាស់សរុប {users.length} នាក់</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ស្វែងរកអ្នកប្រើប្រាស់..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gold-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">កំពុងផ្ទុក...</div>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gold-200/30 last:border-0 hover:bg-gold-50/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-medium text-white">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-secondary">{user.full_name || "មិនមាន"}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className={user.role === "admin" ? "bg-gold-gradient text-white border-0" : ""}>
                          {user.role === "admin" ? "អ្នកគ្រប់គ្រង" : "អ្នកប្រើប្រាស់"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("km-KH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
