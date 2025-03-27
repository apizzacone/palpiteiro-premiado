
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import TeamCard from "@/components/TeamCard";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Championship, Match, Team } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ChampionshipDetail = () => {
  const { id } = useParams();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChampionshipData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch championship data
        const { data: championshipData, error } = await supabase
          .from('championships')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (championshipData) {
          // Fetch teams for this championship
          const { data: teamData, error: teamError } = await supabase
            .from('championship_teams')
            .select(`
              team_id,
              teams:team_id (
                id,
                name,
                country,
                logo
              )
            `)
            .eq('championship_id', championshipData.id);
            
          if (teamError) throw teamError;
          
          const teams = teamData?.map(item => ({
            id: item.teams.id,
            name: item.teams.name,
            country: item.teams.country,
            logo: item.teams.logo || "/placeholder.svg"
          })) || [];
          
          setChampionship({
            id: championshipData.id,
            name: championshipData.name,
            country: championshipData.country,
            logo: championshipData.logo || "/placeholder.svg",
            teams: teams
          });
          
          // Fetch matches for this championship
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
              id,
              date,
              prediction_cost,
              prize,
              status,
              home_score,
              away_score,
              home_team_id,
              away_team_id
            `)
            .eq('championship_id', championshipData.id)
            .order('date');
            
          if (matchesError) throw matchesError;
          
          if (matchesData && matchesData.length > 0) {
            // Get all team IDs from matches
            const teamIds = matchesData.flatMap(match => [match.home_team_id, match.away_team_id]);
            const uniqueTeamIds = [...new Set(teamIds)];
            
            // Fetch teams data
            const { data: matchTeamsData, error: matchTeamsError } = await supabase
              .from('teams')
              .select('*')
              .in('id', uniqueTeamIds);
              
            if (matchTeamsError) throw matchTeamsError;
            
            // Create a map of team IDs to team objects
            const teamsMap = new Map<string, Team>();
            matchTeamsData?.forEach(team => {
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
              
              return {
                id: match.id,
                homeTeam,
                awayTeam,
                championship: {
                  id: championshipData.id,
                  name: championshipData.name,
                  logo: championshipData.logo || "/placeholder.svg",
                  country: championshipData.country,
                  teams: []
                },
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
        }
      } catch (error) {
        console.error('Error fetching championship data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampionshipData();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-20 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mr-2" />
          <span className="text-xl">Carregando informações do campeonato...</span>
        </div>
      </Layout>
    );
  }
  
  if (!championship) {
    return <Navigate to="/championships" replace />;
  }

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <img 
                src={championship.logo} 
                alt={championship.name} 
                className="w-40 h-40 object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{championship.name}</h1>
            <p className="text-muted-foreground">{championship.country}</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="matches" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="matches">Partidas</TabsTrigger>
                <TabsTrigger value="teams">Times</TabsTrigger>
              </TabsList>
              
              <TabsContent value="matches" className="animate-fade-up">
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">Nenhuma partida disponível</h3>
                    <p className="text-muted-foreground">
                      Não há partidas agendadas para este campeonato no momento.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="teams" className="animate-fade-up">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {championship.teams.map(team => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChampionshipDetail;
