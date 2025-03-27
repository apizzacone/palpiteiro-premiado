
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import TeamCard from "@/components/TeamCard";
import { Input } from "@/components/ui/input";
import { Team } from "@/types";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Teams = () => {
  const [filter, setFilter] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        const teamsData: Team[] = data?.map(team => ({
          id: team.id,
          name: team.name,
          country: team.country,
          logo: team.logo || "/placeholder.svg"
        })) || [];
        
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);
  
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Times</h1>
            <p className="text-muted-foreground">
              Conheça os times disponíveis para palpites em nosso sistema
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-12">
            <Input
              placeholder="Buscar time..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando times...</span>
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum time encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca para ver mais resultados.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Teams;
