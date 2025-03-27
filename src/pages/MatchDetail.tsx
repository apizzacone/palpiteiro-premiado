
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { matches, currentUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

const MatchDetail = () => {
  const { id } = useParams();
  const match = matches.find(m => m.id === id);
  
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  
  if (!match) {
    return <Navigate to="/matches" replace />;
  }
  
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
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card overflow-hidden animate-fade-up">
              <div className="bg-secondary p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={match.championship.logo} 
                      alt={match.championship.name} 
                      className="w-10 h-10 object-contain" 
                    />
                    <div>
                      <h1 className="text-xl font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h1>
                      <p className="text-sm text-muted-foreground">{match.championship.name}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(match.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                  <div className="flex flex-col items-center space-y-3 mb-6 md:mb-0">
                    <img 
                      src={match.homeTeam.logo} 
                      alt={match.homeTeam.name} 
                      className="w-24 h-24 object-contain" 
                    />
                    <h2 className="text-lg font-semibold">{match.homeTeam.name}</h2>
                  </div>
                  
                  <div className="text-center font-bold text-3xl mb-6 md:mb-0">VS</div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <img 
                      src={match.awayTeam.logo} 
                      alt={match.awayTeam.name} 
                      className="w-24 h-24 object-contain" 
                    />
                    <h2 className="text-lg font-semibold">{match.awayTeam.name}</h2>
                  </div>
                </div>
                
                <div className="bg-secondary p-4 rounded-lg flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-medium">Prêmio: {match.prize}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">Custo do palpite:</span>
                    <span className="font-medium">{match.predictionCost} créditos</span>
                  </div>
                </div>
                
                <div className="mb-8">
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
                </div>
                
                <div className="flex justify-center">
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
              </CardContent>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MatchDetail;
