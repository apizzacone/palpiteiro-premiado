
import { Card, CardContent } from "@/components/ui/card";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
}

export const TeamCard = ({ team }: TeamCardProps) => {
  return (
    <Card className="overflow-hidden scale-hover">
      <div className="bg-secondary aspect-square flex items-center justify-center p-6">
        <img 
          src={team.logo} 
          alt={team.name} 
          className="w-24 h-24 object-contain" 
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-center">{team.name}</h3>
        <p className="text-xs text-muted-foreground text-center">{team.country}</p>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
