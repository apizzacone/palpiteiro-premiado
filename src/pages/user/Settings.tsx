
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, BellRing, Shield, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SecurityFormValues = {
  password: string;
  confirmPassword: string;
};

type NotificationSettings = {
  emailNotifications: boolean;
  predictionReminders: boolean;
  marketingEmails: boolean;
};

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    predictionReminders: true,
    marketingEmails: false,
  });

  const securityForm = useForm<SecurityFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handlePasswordUpdate = async (data: SecurityFormValues) => {
    if (data.password !== data.confirmPassword) {
      securityForm.setError("confirmPassword", {
        type: "manual",
        message: "As senhas não coincidem",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      securityForm.reset({
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Não foi possível atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    toast({
      title: "Configurações atualizadas",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  const handleDeleteAccount = async () => {
    // This would need to be implemented with appropriate safeguards
    // For now, just show a toast message
    toast({
      title: "Recurso não implementado",
      description: "A exclusão de conta não está disponível no momento.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança da conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua nova senha" {...field} />
                          </FormControl>
                          <FormDescription>
                            Sua senha deve ter pelo menos 8 caracteres.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar nova senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={loading}>
                      {loading ? "Atualizando..." : "Atualizar senha"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emailNotifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                  <Label htmlFor="emailNotifications" className="flex flex-col">
                    <span>Notificações por email</span>
                    <span className="text-sm text-muted-foreground">Receber notificações gerais por email</span>
                  </Label>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="predictionReminders" 
                    checked={notificationSettings.predictionReminders}
                    onCheckedChange={() => handleNotificationChange('predictionReminders')}
                  />
                  <Label htmlFor="predictionReminders" className="flex flex-col">
                    <span>Lembretes de palpites</span>
                    <span className="text-sm text-muted-foreground">Receber lembretes sobre jogos próximos</span>
                  </Label>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="marketingEmails" 
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationChange('marketingEmails')}
                  />
                  <Label htmlFor="marketingEmails" className="flex flex-col">
                    <span>Emails de marketing</span>
                    <span className="text-sm text-muted-foreground">Receber promoções e novidades</span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gerenciar Conta
                </CardTitle>
                <CardDescription>
                  Gerencie suas configurações de conta e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Seu email atual é <strong>{user?.email}</strong>
                  </p>
                  <Button variant="outline">Alterar email</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Sair de todos os dispositivos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Encerre todas as sessões ativas em outros dispositivos
                  </p>
                  <Button variant="outline">Sair de todos os dispositivos</Button>
                </div>
                
                <Separator />
                
                <Collapsible
                  open={deleteAccountOpen}
                  onOpenChange={setDeleteAccountOpen}
                  className="border border-destructive/20 rounded-md p-4"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="destructive" className="w-full flex items-center justify-between">
                      <span>Excluir conta</span>
                      <AlertTriangle className="h-4 w-4 ml-2" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                      >
                        Excluir permanentemente
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
