
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Match } from "@/types";
import { currentUser } from "@/lib/mock-data";
import { toast } from "sonner";

interface MatchPredictionFormProps {
  match: Match;
}

const MatchPredictionForm = ({ match }: MatchPredictionFormProps) => {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");

  const handlePrediction = () => {
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
    
    if (currentUser.credits < match.predictionCost) {
      toast.error("Você não tem créditos suficientes");
      return;
    }
    
    // Here we would send the prediction to the backend
    toast.success("Palpite registrado com sucesso!");
    setHomeScore("");
    setAwayScore("");
  };

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
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={handlePrediction}
          disabled={homeScore === "" || awayScore === ""}
        >
          Confirmar Palpite
        </Button>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Seus créditos atuais: <span className="font-medium text-foreground">{currentUser.credits} créditos</span>
      </div>
    </div>
  );
};

export default MatchPredictionForm;
