
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { profile } = useAuth();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Verifica se o usuário é admin
  const isAdmin = profile?.is_admin === true;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      
      {/* Admin panel floating button */}
      {isAdmin && (
        <Link
          to="/admin"
          className={cn(
            "fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg",
            "hover:bg-primary/90 transition-all"
          )}
          aria-label="Painel Administrativo"
          title="Painel Administrativo"
        >
          <Shield className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
};

export default Layout;
