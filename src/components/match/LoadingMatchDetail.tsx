
import { Loader2 } from "lucide-react";

const LoadingMatchDetail = () => {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span>Carregando detalhes da partida...</span>
    </div>
  );
};

export default LoadingMatchDetail;
