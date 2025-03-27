
import { Match } from "@/types";
import MatchCard from "@/components/MatchCard";

interface MatchesGridProps {
  matches: Match[];
}

const MatchesGrid = ({ matches }: MatchesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
};

export default MatchesGrid;
