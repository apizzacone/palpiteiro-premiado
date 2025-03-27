
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MatchCard from "@/components/MatchCard";
import TeamCard from "@/components/TeamCard";
import ChampionshipCard from "@/components/ChampionshipCard";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Team, Match, Championship } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [featuredChampionships, setFeaturedChampionships] = useState<Championship[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch championships first to have them available for matches
        const { data: championshipsData, error: championshipsError } = await supabase
          .from('championships')
          .select('*')
          .order('name')
          .limit(3);
          
        if (championshipsError) throw championshipsError;
        
        // Create a map for quick championship lookup
        const championshipsMap = new Map<string, Championship>();
        
        if (championshipsData) {
          // Transform championships data into Championship objects
          const formattedChampionships: Championship[] = await Promise.all(
            championshipsData.map(async (championship) => {
              // Fetch teams for this championship
              const { data: teamData } = await supabase
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
                .eq('championship_id', championship.id);
              
              const teams = teamData?.map(item => ({
                id: item.teams.id,
                name: item.teams.name,
                country: item.teams.country,
                logo: item.teams.logo || "/placeholder.svg"
              })) || [];
              
              const championshipObj = {
                id: championship.id,
                name: championship.name,
                country: championship.country,
                logo: championship.logo || "/placeholder.svg",
                teams: teams
              };
              
              championshipsMap.set(championship.id, championshipObj);
              return championshipObj;
            })
          );
          
          setFeaturedChampionships(formattedChampionships);
        }
        
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('name')
          .limit(6);
          
        if (teamsError) throw teamsError;
        
        const teamsMap = new Map<string, Team>();
        const formattedTeams: Team[] = teamsData?.map(team => {
          const teamObj = {
            id: team.id,
            name: team.name,
            country: team.country,
            logo: team.logo || "/placeholder.svg"
          };
          teamsMap.set(team.id, teamObj);
          return teamObj;
        }) || [];
        
        setFeaturedTeams(formattedTeams);
        
        // Fetch matches
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
            championship_id,
            home_team_id,
            away_team_id
          `)
          .order('date')
          .limit(3);
        
        if (matchesError) throw matchesError;
        
        if (matchesData) {
          // Get all team IDs from matches that aren't already in teamsMap
          const teamIds = matchesData.flatMap(match => [match.home_team_id, match.away_team_id])
            .filter(id => !teamsMap.has(id));
          
          const uniqueTeamIds = [...new Set(teamIds)];
          
          if (uniqueTeamIds.length > 0) {
            const { data: additionalTeamsData, error: additionalTeamsError } = await supabase
              .from('teams')
              .select('*')
              .in('id', uniqueTeamIds);
              
            if (additionalTeamsError) throw additionalTeamsError;
            
            additionalTeamsData?.forEach(team => {
              teamsMap.set(team.id, {
                id: team.id,
                name: team.name,
                logo: team.logo || "/placeholder.svg",
                country: team.country
              });
            });
          }
          
          // Transform raw data into Match objects
          const formattedMatches: Match[] = matchesData.map(match => {
            const homeTeam = teamsMap.get(match.home_team_id) as Team;
            const awayTeam = teamsMap.get(match.away_team_id) as Team;
            
            // Find championship from our map or create a default one
            const championship = championshipsMap.get(match.championship_id) || {
              id: match.championship_id,
              name: "Campeonato",
              logo: "/placeholder.svg",
              country: "Brasil",
              teams: []
            };
            
            // Ensure status is one of the allowed values
            const status = match.status === "scheduled" || match.status === "live" || match.status === "finished" 
              ? match.status as "scheduled" | "live" | "finished"
              : "scheduled";
            
            return {
              id: match.id,
              homeTeam,
              awayTeam,
              championship,
              date: new Date(match.date),
              status,
              homeScore: match.home_score,
              awayScore: match.away_score,
              predictionCost: match.prediction_cost,
              prize: match.prize
            };
          });
          
          setUpcomingMatches(formattedMatches);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedTeams([]);
        setUpcomingMatches([]);
        setFeaturedChampionships([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <HeroSection />
      
      <FeaturesSection />
      
      {/* Upcoming Matches Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">Próximas Partidas</h2>
            <Button variant="outline" asChild>
              <Link to="/matches">Ver todas</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Carregando partidas...</span>
            </div>
          ) : upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma partida disponível no momento.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Teams Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">Times</h2>
            <Button variant="outline" asChild>
              <Link to="/teams">Ver todos</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Carregando times...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {featuredTeams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Championships Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">Campeonatos</h2>
            <Button variant="outline" asChild>
              <Link to="/championships">Ver todos</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Carregando campeonatos...</span>
            </div>
          ) : featuredChampionships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredChampionships.map(championship => (
                <ChampionshipCard key={championship.id} championship={championship} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum campeonato disponível no momento. Adicione campeonatos no painel administrativo.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar a fazer seus palpites?
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
            Cadastre-se agora e ganhe 50 créditos para começar a fazer seus palpites nas partidas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth?tab=register">Criar conta</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/matches">Ver partidas</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
