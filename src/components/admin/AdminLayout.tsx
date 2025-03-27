
import { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { 
  Trophy, 
  Users, 
  Calendar, 
  LayoutDashboard,
  Shield,
  CreditCard, 
  Database
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider 
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { profile, user } = useAuth();
  
  // Verificar se o usuário é admin
  const isAdmin = profile?.is_admin === true;

  // Redirecionar para a página inicial se não for admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Shield className="h-6 w-6 text-primary" />
              <div className="font-semibold text-lg">Painel Admin</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/teams">
                    <Users />
                    <span>Times</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/championships">
                    <Trophy />
                    <span>Campeonatos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/matches">
                    <Calendar />
                    <span>Partidas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/credits">
                    <CreditCard />
                    <span>Créditos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/backup">
                    <Database />
                    <span>Backup & Restore</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-6 md:p-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || profile?.username || user?.email}
              </span>
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                <AvatarFallback>
                  {profile?.full_name 
                    ? profile.full_name.substring(0, 2).toUpperCase() 
                    : user?.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
