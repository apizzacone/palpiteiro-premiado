
import { Card, CardContent } from "@/components/ui/card";
import { Championship } from "@/types";
import { Link } from "react-router-dom";

interface ChampionshipCardProps {
  championship: Championship;
}

export const ChampionshipCard = ({ championship }: ChampionshipCardProps) => {
  return (
    <Link to={`/championships/${championship.id}`}>
      <Card className="overflow-hidden scale-hover">
        <div className="bg-secondary aspect-video flex items-center justify-center p-6">
          <img 
            src={championship.logo} 
            alt={championship.name} 
            className="w-32 h-32 object-contain" 
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-center">{championship.name}</h3>
          <p className="text-xs text-muted-foreground text-center">{championship.country}</p>
          <div className="mt-2 text-xs text-center text-muted-foreground">
            {championship.teams.length} times
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ChampionshipCard;
