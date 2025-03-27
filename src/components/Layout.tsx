
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { currentUser } from "@/lib/mock-data";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Simple check to determine if user is admin
  const isAdmin = currentUser && currentUser.id === "1";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={currentUser} />
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
          aria-label="Admin Panel"
          title="Admin Panel"
        >
          <Shield className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
};

export default Layout;
