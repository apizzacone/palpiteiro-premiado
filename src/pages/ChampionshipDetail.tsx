
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import TeamCard from "@/components/TeamCard";
import MatchCard from "@/components/MatchCard";
import { championships, matches } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChampionshipDetail = () => {
  const { id } = useParams();
  const championship = championships.find(c => c.id === id);
  
  if (!championship) {
    return <Navigate to="/championships" replace />;
  }
  
  const championshipMatches = matches.filter(match => match.championship.id === id);

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
                {championshipMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {championshipMatches.map(match => (
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
