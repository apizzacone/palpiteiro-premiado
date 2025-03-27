
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Match } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MatchCardProps {
  match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  
  const handleNavigateToMatch = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/matches/${match.id}`);
  };
  
  return (
    <Card className="overflow-hidden scale-hover">
      <CardHeader className="bg-secondary p-3 flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src={match.championship.logo} 
            alt={match.championship.name} 
            className="w-6 h-6 object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <span className="text-xs font-medium">{match.championship.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {format(match.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center space-y-2 w-1/3">
            <img 
              src={match.homeTeam.logo} 
              alt={match.homeTeam.name} 
              className="w-16 h-16 object-contain" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <p className="text-sm font-medium text-center">{match.homeTeam.name}</p>
          </div>
          
          <div className="flex flex-col items-center w-1/3">
            <div className="text-2xl font-semibold mb-1">VS</div>
            <Button 
              className="scale-hover w-full" 
              size="sm"
              onClick={handleNavigateToMatch}
            >
              Palpitar
            </Button>
          </div>
          
          <div className="flex flex-col items-center space-y-2 w-1/3">
            <img 
              src={match.awayTeam.logo} 
              alt={match.awayTeam.name} 
              className="w-16 h-16 object-contain" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <p className="text-sm font-medium text-center">{match.awayTeam.name}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-3">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Prêmio: {match.prize}</span>
          </div>
          <div className="text-xs font-medium">
            <span className="text-muted-foreground">Custo: </span>
            {match.predictionCost} créditos
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
