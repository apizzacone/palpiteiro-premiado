
import { Loader2 } from "lucide-react";

const MatchesLoading = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span>Carregando partidas...</span>
    </div>
  );
};

export default MatchesLoading;
