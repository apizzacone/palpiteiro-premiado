
import { useState } from "react";
import Layout from "@/components/Layout";
import MatchCard from "@/components/MatchCard";
import { matches, championships } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const Matches = () => {
  const [filter, setFilter] = useState("");
  const [championshipFilter, setChampionshipFilter] = useState("");
  
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(filter.toLowerCase()) || 
                         match.awayTeam.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesChampionship = championshipFilter ? 
                              match.championship.id === championshipFilter : 
                              true;
    
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
          
          {filteredMatches.length > 0 ? (
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
