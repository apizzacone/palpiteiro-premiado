import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, LucideIcon } from "lucide-react";
import UserCredit from "./UserCredit";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Change this line to check if user exists instead of isAuthenticated
  const isAuthenticated = !!user;

  return (
    <div className="bg-background border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-bold text-xl">
          Palpiteiro
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <UserCredit />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/auth/sign-in")}>Entrar</Button>
              <Button onClick={() => navigate("/auth/sign-up")}>Cadastrar</Button>
            </>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-sm">
            <div className="grid gap-4 py-4">
              {isAuthenticated ? (
                <>
                  <div className="text-sm">
                    Logado como {user?.email}
                  </div>
                  <Button variant="outline" onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                  <Button variant="destructive" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/auth/sign-in")}>Entrar</Button>
                  <Button onClick={() => navigate("/auth/sign-up")}>Cadastrar</Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
