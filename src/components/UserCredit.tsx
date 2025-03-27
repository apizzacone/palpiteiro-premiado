
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BanknoteIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserCredit = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  if (!profile) return null;
  
  return (
    <div className="flex items-center">
      <div className="mr-2 text-sm">
        <span className="font-bold">{profile.credits}</span> créditos
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center text-xs h-8"
        onClick={() => navigate("/user/buy-credits")}
      >
        <BanknoteIcon className="h-3.5 w-3.5 mr-1" />
        Comprar
      </Button>
    </div>
  );
};

export default UserCredit;
