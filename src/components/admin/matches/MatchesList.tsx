
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Match } from "@/types";

interface MatchesListProps {
  isLoading: boolean;
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
}

const MatchesList = ({ isLoading, matches, onEdit, onDelete }: MatchesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Carregando partidas...</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Times</TableHead>
          <TableHead>Campeonato</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Custo</TableHead>
          <TableHead>Prêmio</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.length > 0 ? (
          matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{match.homeTeam.name}</span>
                  <span>vs</span>
                  <span className="font-medium">{match.awayTeam.name}</span>
                  {match.status !== 'scheduled' && (
                    <span className="text-muted-foreground ml-2">
                      ({match.homeScore} - {match.awayScore})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{match.championship.name}</TableCell>
              <TableCell>{format(new Date(match.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs inline-flex items-center justify-center font-medium",
                  match.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  match.status === 'live' && "bg-green-100 text-green-800",
                  match.status === 'finished' && "bg-gray-100 text-gray-800"
                )}>
                  {match.status === 'scheduled' && "Agendada"}
                  {match.status === 'live' && "Ao vivo"}
                  {match.status === 'finished' && "Finalizada"}
                </div>
              </TableCell>
              <TableCell>{match.predictionCost} créditos</TableCell>
              <TableCell>{match.prize}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(match)} className="mr-2">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(match.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma partida cadastrada. Clique em "Adicionar Partida" para cadastrar.
              </p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MatchesList;
