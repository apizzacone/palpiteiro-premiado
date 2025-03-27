
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MatchCard from "@/components/MatchCard";
import { championships } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Match, Team, Championship } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Matches = () => {
  const [filter, setFilter] = useState("");
  const [championshipFilter, setChampionshipFilter] = useState("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
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
          `);
        
        if (error) throw error;
        
        if (matchesData) {
          // We need to fetch teams data to construct complete match objects
          const teamIds = matchesData.flatMap(match => [match.home_team_id, match.away_team_id]);
          const uniqueTeamIds = [...new Set(teamIds)];
          
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', uniqueTeamIds);
            
          if (teamsError) throw teamsError;
          
          // Create a map of team IDs to team objects
          const teamsMap = new Map<string, Team>();
          teamsData?.forEach(team => {
            teamsMap.set(team.id, {
              id: team.id,
              name: team.name,
              logo: team.logo || "/placeholder.svg",
              country: team.country
            });
          });
          
          // Transform raw data into Match objects
          const formattedMatches: Match[] = matchesData.map(match => {
            const homeTeam = teamsMap.get(match.home_team_id) as Team;
            const awayTeam = teamsMap.get(match.away_team_id) as Team;
            
            // Find championship from mock data for now
            const championship = championships.find(c => c.id === match.championship_id) || {
              id: match.championship_id,
              name: "Campeonato",
              logo: "/placeholder.svg",
              country: "Brasil",
              teams: []
            };
            
            return {
              id: match.id,
              homeTeam,
              awayTeam,
              championship,
              date: new Date(match.date),
              status: match.status as 'scheduled' | 'live' | 'finished',
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);
  
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(filter.toLowerCase()) || 
                         match.awayTeam.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesChampionship = championshipFilter === "all" ? 
                              true : 
                              match.championship.id === championshipFilter;
    
    return matchesSearch && matchesChampionship;
  });

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Partidas</h1>
            <p className="text-muted-foreground">
              Confira as partidas disponíveis para palpites e concorra a prêmios exclusivos
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Buscar por time..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select
                  value={championshipFilter}
                  onValueChange={setChampionshipFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os campeonatos</SelectItem>
                    {championships.map(championship => (
                      <SelectItem key={championship.id} value={championship.id}>
                        {championship.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Carregando partidas...</span>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhuma partida encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros para ver mais resultados.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Matches;
