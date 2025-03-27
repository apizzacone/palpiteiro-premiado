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
import { Menu, User, LogOut, Settings, CreditCard } from "lucide-react";
import UserCredit from "./UserCredit";
import Navigation from "./Navigation";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAuthenticated = !!user;

  return (
    <div className="bg-background border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center space-x-6">
          <Link to="/" className="font-bold text-xl">
            Palpiteiro
          </Link>
          <Navigation />
        </div>

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
                  <DropdownMenuItem onClick={() => navigate("/user/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/predictions")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Palpites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/user/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/user/buy-credits")}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Comprar créditos</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/auth")}>Entrar</Button>
              <Button onClick={() => navigate("/auth?tab=register")}>Cadastrar</Button>
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
              <Link 
                to="/" 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/matches" 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Partidas
              </Link>
              <Link 
                to="/predictions" 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Palpites
              </Link>
              <Link 
                to="/championships" 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Campeonatos
              </Link>
              <Link 
                to="/teams" 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Times
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="text-sm">
                    Logado como {user?.email}
                  </div>
                  <Button variant="outline" onClick={() => {
                    navigate("/user/profile");
                    setIsOpen(false);
                  }}>
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button variant="outline" onClick={() => {
                    navigate("/predictions");
                    setIsOpen(false);
                  }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Palpites
                  </Button>
                  <Button variant="outline" onClick={() => {
                    navigate("/user/settings");
                    setIsOpen(false);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                  <Button variant="outline" onClick={() => {
                    navigate("/user/buy-credits");
                    setIsOpen(false);
                  }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Comprar créditos
                  </Button>
                  <Button variant="destructive" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}>Entrar</Button>
                  <Button onClick={() => {
                    navigate("/auth?tab=register");
                    setIsOpen(false);
                  }}>Cadastrar</Button>
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
