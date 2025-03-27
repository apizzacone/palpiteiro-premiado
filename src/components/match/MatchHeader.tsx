
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Match } from "@/types";

interface MatchHeaderProps {
  match: Match;
}

const MatchHeader = ({ match }: MatchHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img 
          src={match.championship.logo} 
          alt={match.championship.name} 
          className="w-10 h-10 object-contain" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div>
          <h1 className="text-xl font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h1>
          <p className="text-sm text-muted-foreground">{match.championship.name}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {format(match.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
      </div>
    </div>
  );
};

export default MatchHeader;
