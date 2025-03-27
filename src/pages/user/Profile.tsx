
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, CreditCard, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type ProfileFormValues = {
  full_name: string;
  username: string;
  avatar_url: string;
};

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Tables<"credit_transactions">[]>([]);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      avatar_url: profile?.avatar_url || "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Set form values when profile data is loaded
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
      });
    }

    // Load recent transactions
    fetchRecentTransactions();
  }, [user, profile, form, navigate]);

  const fetchRecentTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Meu Perfil
                </CardTitle>
                <CardDescription>
                  Visualize e edite suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-4">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Avatar"} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{profile?.full_name || profile?.username || "Usuário"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-4 py-2 px-4 bg-secondary rounded-md flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">{profile?.credits || 0} créditos</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/user/buy-credits")}
                >
                  Comprar créditos
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => signOut()}
                >
                  Sair
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Últimas Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <ul className="space-y-3">
                    {transactions.map((transaction) => (
                      <li key={transaction.id} className="text-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {transaction.amount} créditos
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status === 'approved' 
                              ? 'Aprovado' 
                              : transaction.status === 'pending'
                              ? 'Pendente'
                              : 'Rejeitado'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Você ainda não possui transações.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full" onClick={() => navigate("/user/transactions")}>
                  Ver todas as transações
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este é o nome que será exibido no seu perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome de usuário" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este é o nome que outros usuários verão.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Foto de Perfil</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a URL da sua foto de perfil" {...field} />
                        </FormControl>
                        <FormDescription>
                          Insira o link da sua imagem de perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
