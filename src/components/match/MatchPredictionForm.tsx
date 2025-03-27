
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Match } from "@/types";
import { currentUser } from "@/lib/mock-data";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface MatchPredictionFormProps {
  match: Match;
}

const MatchPredictionForm = ({ match }: MatchPredictionFormProps) => {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  
  const userCredits = profile?.credits || currentUser.credits;

  const handlePrediction = () => {
    setIsSubmitting(true);
    
    try {
      const homeScoreNum = parseInt(homeScore);
      const awayScoreNum = parseInt(awayScore);
      
      if (isNaN(homeScoreNum) || isNaN(awayScoreNum)) {
        toast.error("Por favor, informe um placar válido");
        return;
      }
      
      if (homeScoreNum < 0 || awayScoreNum < 0) {
        toast.error("Os placares não podem ser negativos");
        return;
      }
      
      if (userCredits < match.predictionCost) {
        toast.error(`Você não tem créditos suficientes. Necessário: ${match.predictionCost} créditos`);
        return;
      }
      
      // Here we would send the prediction to the backend
      toast.success("Palpite registrado com sucesso!");
      setHomeScore("");
      setAwayScore("");
    } catch (error) {
      console.error("Erro ao registrar palpite:", error);
      toast.error("Erro ao registrar palpite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const notEnoughCredits = userCredits < match.predictionCost;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Faça seu palpite</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <p className="text-sm mb-2">{match.homeTeam.name}</p>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-20 text-center text-lg"
            disabled={notEnoughCredits}
          />
        </div>
        
        <span className="text-lg font-bold my-2 md:my-0">×</span>
        
        <div className="flex flex-col items-center">
          <p className="text-sm mb-2">{match.awayTeam.name}</p>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-20 text-center text-lg"
            disabled={notEnoughCredits}
          />
        </div>
      </div>

      {notEnoughCredits && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-center">
          Você não tem créditos suficientes para fazer este palpite. 
          <br />Necessário: {match.predictionCost} créditos.
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={handlePrediction}
          disabled={homeScore === "" || awayScore === "" || notEnoughCredits || isSubmitting}
        >
          {isSubmitting ? "Processando..." : "Confirmar Palpite"}
        </Button>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Seus créditos atuais: <span className="font-medium text-foreground">{userCredits} créditos</span>
        {notEnoughCredits && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = "/user/buy-credits"}
            >
              Comprar créditos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPredictionForm;
