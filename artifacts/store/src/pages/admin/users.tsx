import { useLocation } from "wouter";
import { useListUsers, getListUsersQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey(), enabled: !!user && user.role === "admin" } });

  if (!user) { navigate("/sign-in"); return null; }
  if (user.role !== "admin") { navigate("/"); return null; }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Users</h1>

        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="p-3"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>
                ))
              ) : !users || users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground">#{u.id}</td>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
