
import Layout from "@/components/Layout";
import { useMatches } from "@/hooks/use-matches";
import MatchesFilter from "@/components/match/MatchesFilter";
import MatchesGrid from "@/components/match/MatchesGrid";
import MatchesLoading from "@/components/match/MatchesLoading";
import MatchesEmpty from "@/components/match/MatchesEmpty";

const Matches = () => {
  const {
    filter,
    setFilter,
    championshipFilter,
    setChampionshipFilter,
    championships,
    loading,
    filteredMatches
  } = useMatches();

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
          
          <MatchesFilter
            filter={filter}
            setFilter={setFilter}
            championshipFilter={championshipFilter}
            setChampionshipFilter={setChampionshipFilter}
            championships={championships}
          />
          
          {loading ? (
            <MatchesLoading />
          ) : filteredMatches.length > 0 ? (
            <MatchesGrid matches={filteredMatches} />
          ) : (
            <MatchesEmpty />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Matches;
