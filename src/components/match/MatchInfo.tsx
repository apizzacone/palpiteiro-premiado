
import { Match } from "@/types";
import { Trophy } from "lucide-react";

interface MatchInfoProps {
  match: Match;
}

const MatchInfo = ({ match }: MatchInfoProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div className="flex flex-col items-center space-y-3 mb-6 md:mb-0">
          <img 
            src={match.homeTeam.logo} 
            alt={match.homeTeam.name} 
            className="w-24 h-24 object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <h2 className="text-lg font-semibold">{match.homeTeam.name}</h2>
        </div>
        
        <div className="text-center font-bold text-3xl mb-6 md:mb-0">VS</div>
        
        <div className="flex flex-col items-center space-y-3">
          <img 
            src={match.awayTeam.logo} 
            alt={match.awayTeam.name} 
            className="w-24 h-24 object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <h2 className="text-lg font-semibold">{match.awayTeam.name}</h2>
        </div>
      </div>
      
      <div className="bg-secondary p-4 rounded-lg flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-medium">Prêmio: {match.prize}</span>
        </div>
        <div>
          <span className="text-muted-foreground mr-1">Custo do palpite:</span>
          <span className="font-medium">{match.predictionCost} créditos</span>
        </div>
      </div>
    </>
  );
};

export default MatchInfo;
