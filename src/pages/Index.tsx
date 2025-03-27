
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MatchCard from "@/components/MatchCard";
import TeamCard from "@/components/TeamCard";
import ChampionshipCard from "@/components/ChampionshipCard";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { matches, teams, championships } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Team } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>([]);
  
  // Only show first 3 of each for the homepage
  const upcomingMatches = matches.slice(0, 3);
  const featuredChampionships = championships.slice(0, 3);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('name')
          .limit(6);
          
        if (error) throw error;
        
        const teamsData: Team[] = data?.map(team => ({
          id: team.id,
          name: team.name,
          country: team.country,
          logo: team.logo || "/placeholder.svg"
        })) || [];
        
        setFeaturedTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
        // Fallback to mock data if there's an error
        setFeaturedTeams(teams.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
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
            <div className="flex justify-center items-center py-10">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredChampionships.map(championship => (
              <ChampionshipCard key={championship.id} championship={championship} />
            ))}
          </div>
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
