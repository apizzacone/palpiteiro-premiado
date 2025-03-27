
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { 
  Trophy, 
  Users, 
  Calendar, 
  LayoutDashboard,
  Shield
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
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

// In a real application, this would be handled by a proper auth system
// For now, we'll use a simple check if the user is an admin
const isAdmin = () => {
  return currentUser && currentUser.id === "1"; // Assuming user 1 is admin
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Redirect to home if not admin
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Shield className="h-6 w-6 text-primary" />
              <div className="font-semibold text-lg">Admin Panel</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/teams">
                    <Users />
                    <span>Times</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/championships">
                    <Trophy />
                    <span>Campeonatos</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/matches">
                    <Calendar />
                    <span>Partidas</span>
                  </a>
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
                {currentUser?.name}
              </span>
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt={currentUser?.name} />
                <AvatarFallback>
                  {currentUser?.name.substring(0, 2).toUpperCase()}
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
