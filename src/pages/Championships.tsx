
import { useState } from "react";
import Layout from "@/components/Layout";
import ChampionshipCard from "@/components/ChampionshipCard";
import { championships } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

const Championships = () => {
  const [filter, setFilter] = useState("");
  
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
          
          {filteredChampionships.length > 0 ? (
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
