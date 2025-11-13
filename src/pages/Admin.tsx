import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, Shield, User } from "lucide-react";
import { z } from "zod";

const collaboratorSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
  isAdmin: z.boolean(),
});

type Profile = {
  id: string;
  name: string;
  email: string;
  user_roles: Array<{ role: string }>;
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
      return;
    }
    fetchProfiles();
  }, [isAdmin, navigate]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles(role)
      `);

    if (error) {
      toast.error("Erro ao carregar colaboradores");
      console.error(error);
    } else {
      setProfiles(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = collaboratorSchema.parse({
        name: name.trim(),
        email: email.trim(),
        password,
        isAdmin: makeAdmin,
      });

      // Create user via auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            name: validated.name,
          },
        },
      });

      if (authError) throw authError;

      // If admin, add admin role
      if (validated.isAdmin && authData.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: "admin",
          });

        if (roleError) throw roleError;
      }

      toast.success("Colaborador cadastrado com sucesso!");
      setName("");
      setEmail("");
      setPassword("");
      setMakeAdmin(false);
      fetchProfiles();
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error("Erro ao cadastrar colaborador");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Cadastrar Colaborador
              </CardTitle>
              <CardDescription>
                Adicione novos colaboradores ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Inicial</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="admin"
                    checked={makeAdmin}
                    onChange={(e) => setMakeAdmin(e.target.checked)}
                    disabled={loading}
                    className="rounded border-input"
                  />
                  <Label htmlFor="admin" className="cursor-pointer">
                    Cadastrar como Administrador
                  </Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Cadastrando..." : "Cadastrar Colaborador"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">Colaboradores</CardTitle>
              <CardDescription>
                Lista de todos os colaboradores cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => {
                      const isAdminUser = profile.user_roles.some(
                        (role) => role.role === "admin"
                      );
                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={isAdminUser ? "default" : "secondary"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {isAdminUser ? (
                                <>
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3" />
                                  Colaborador
                                </>
                              )}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
