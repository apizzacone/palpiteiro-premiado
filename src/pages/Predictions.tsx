
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Predictions = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // Fetch matches
        const { data: matchesData, error } = await supabase
          .from('matches')
          .select(`
            id,
            date,
            prediction_cost,
            prize,
            status,
            home_score,
            away_score,
            championship_id,
            home_team_id,
            away_team_id
          `)
          .eq('status', 'scheduled')
          .order('date');
        
        if (error) throw error;
        
        if (matchesData) {
          // Fetch teams data
          const teamIds = matchesData.flatMap(match => [match.home_team_id, match.away_team_id]);
          const uniqueTeamIds = [...new Set(teamIds)];
          
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', uniqueTeamIds);
            
          if (teamsError) throw teamsError;
          
          // Fetch championships data
          const championshipIds = [...new Set(matchesData.map(match => match.championship_id))];
          
          const { data: championshipsData, error: championshipsError } = await supabase
            .from('championships')
            .select('*')
            .in('id', championshipIds);
            
          if (championshipsError) throw championshipsError;
          
          // Create maps for quick lookups
          const teamsMap = new Map();
          teamsData?.forEach(team => {
            teamsMap.set(team.id, {
              id: team.id,
              name: team.name,
              logo: team.logo || "/placeholder.svg",
              country: team.country
            });
          });
          
          const championshipsMap = new Map();
          championshipsData?.forEach(championship => {
            championshipsMap.set(championship.id, {
              id: championship.id,
              name: championship.name,
              logo: championship.logo || "/placeholder.svg",
              country: championship.country,
              teams: []
            });
          });
          
          // Transform raw data into Match objects
          const formattedMatches = matchesData.map(match => {
            const homeTeam = teamsMap.get(match.home_team_id);
            const awayTeam = teamsMap.get(match.away_team_id);
            const championship = championshipsMap.get(match.championship_id);
            
            return {
              id: match.id,
              homeTeam,
              awayTeam,
              championship,
              date: new Date(match.date),
              status: match.status,
              homeScore: match.home_score,
              awayScore: match.away_score,
              predictionCost: match.prediction_cost,
              prize: match.prize
            };
          });
          
          setMatches(formattedMatches);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast.error("Erro ao carregar partidas");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setHomeScore("");
    setAwayScore("");
  };

  const handlePrediction = async () => {
    if (!selectedMatch || !profile) return;
    
    try {
      setIsSubmitting(true);
      
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
      
      if (profile.credits < selectedMatch.predictionCost) {
        toast.error(`Você não tem créditos suficientes. Necessário: ${selectedMatch.predictionCost} créditos`);
        return;
      }

      // Here we would send the prediction to the backend
      // For now, just show a success message
      toast.success("Palpite registrado com sucesso!");
      
      // Reset the form
      setSelectedMatch(null);
      setHomeScore("");
      setAwayScore("");
    } catch (error) {
      console.error("Erro ao registrar palpite:", error);
      toast.error("Erro ao registrar palpite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Fazer Palpites</h1>
            <p className="text-muted-foreground mb-6">
              Escolha uma partida e faça seu palpite para concorrer a prêmios exclusivos
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Carregando partidas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Partidas Disponíveis</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {matches.length > 0 ? (
                    matches.map((match) => (
                      <Card 
                        key={match.id} 
                        className={`cursor-pointer transition-colors hover:bg-secondary/50 ${selectedMatch?.id === match.id ? 'border-primary bg-secondary/50' : ''}`}
                        onClick={() => handleSelectMatch(match)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {format(match.date, "dd/MM · HH:mm", { locale: ptBR })}
                            </span>
                            <span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              {match.predictionCost} créditos
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={match.homeTeam.logo} 
                                alt={match.homeTeam.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <span className="font-medium text-sm">{match.homeTeam.name}</span>
                            </div>
                            <span className="text-xs">VS</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{match.awayTeam.name}</span>
                              <img 
                                src={match.awayTeam.logo} 
                                alt={match.awayTeam.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 flex items-center">
                            <img 
                              src={match.championship.logo} 
                              alt={match.championship.name}
                              className="w-4 h-4 mr-1 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                            {match.championship.name}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma partida disponível no momento</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate("/matches")}
                      >
                        Ver todas as partidas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    {selectedMatch ? (
                      <div>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={selectedMatch.championship.logo} 
                                alt={selectedMatch.championship.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <h3 className="font-semibold">{selectedMatch.championship.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(selectedMatch.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">Custo do palpite:</div>
                              <div className="font-bold text-primary">{selectedMatch.predictionCost} créditos</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row justify-between items-center my-8 p-4 bg-secondary/30 rounded-lg">
                            <div className="flex flex-col items-center md:w-1/3 mb-4 md:mb-0">
                              <img 
                                src={selectedMatch.homeTeam.logo} 
                                alt={selectedMatch.homeTeam.name}
                                className="w-16 h-16 object-contain mb-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <h3 className="font-semibold text-center">{selectedMatch.homeTeam.name}</h3>
                            </div>
                            
                            <div className="flex items-center justify-center md:w-1/3 mb-4 md:mb-0">
                              <span className="text-2xl font-bold">VS</span>
                            </div>
                            
                            <div className="flex flex-col items-center md:w-1/3">
                              <img 
                                src={selectedMatch.awayTeam.logo} 
                                alt={selectedMatch.awayTeam.name}
                                className="w-16 h-16 object-contain mb-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <h3 className="font-semibold text-center">{selectedMatch.awayTeam.name}</h3>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Faça seu palpite</h3>
                          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                            <div className="flex flex-col items-center">
                              <p className="text-sm mb-2">{selectedMatch.homeTeam.name}</p>
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
                              <p className="text-sm mb-2">{selectedMatch.awayTeam.name}</p>
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
                          
                          <div className="flex justify-center">
                            <Button 
                              size="lg" 
                              onClick={handlePrediction}
                              disabled={homeScore === "" || awayScore === "" || isSubmitting}
                            >
                              {isSubmitting ? "Processando..." : "Confirmar Palpite"}
                            </Button>
                          </div>
                          
                          <div className="mt-6 text-center text-sm text-muted-foreground">
                            Seus créditos atuais: <span className="font-medium text-foreground">{profile?.credits || 0} créditos</span>
                            
                            {profile && profile.credits < (selectedMatch?.predictionCost || 0) && (
                              <div className="mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate("/user/buy-credits")}
                                >
                                  Comprar créditos
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <h3 className="text-xl font-medium mb-2">Selecione uma partida</h3>
                        <p className="text-muted-foreground mb-6">
                          Escolha uma partida da lista para fazer seu palpite
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => navigate("/matches")}
                        >
                          Ver todas as partidas
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Predictions;
