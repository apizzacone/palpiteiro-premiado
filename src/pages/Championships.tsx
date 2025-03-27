
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ChampionshipCard from "@/components/ChampionshipCard";
import { Input } from "@/components/ui/input";
import { Championship } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Championships = () => {
  const [filter, setFilter] = useState("");
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        setLoading(true);
        
        // Fetch championships from database
        const { data: championshipsData, error } = await supabase
          .from('championships')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        if (championshipsData) {
          // Transform raw data into Championship objects
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
              
              return {
                id: championship.id,
                name: championship.name,
                country: championship.country,
                logo: championship.logo || "/placeholder.svg",
                teams: teams
              };
            })
          );
          
          setChampionships(formattedChampionships);
        }
      } catch (error) {
        console.error('Error fetching championships:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampionships();
  }, []);
  
  const filteredChampionships = championships.filter(championship =>
    championship.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Campeonatos</h1>
            <p className="text-muted-foreground">
              Conheça os campeonatos disponíveis para palpites em nosso sistema
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-12">
            <Input
              placeholder="Buscar campeonato..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Carregando campeonatos...</span>
            </div>
          ) : filteredChampionships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredChampionships.map(championship => (
                <ChampionshipCard key={championship.id} championship={championship} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum campeonato encontrado</h3>
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

export default Championships;
