
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Championship } from "@/types";

interface MatchesFilterProps {
  filter: string;
  setFilter: (value: string) => void;
  championshipFilter: string;
  setChampionshipFilter: (value: string) => void;
  championships: Championship[];
}

const MatchesFilter = ({
  filter,
  setFilter,
  championshipFilter,
  setChampionshipFilter,
  championships
}: MatchesFilterProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            placeholder="Buscar por time..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={championshipFilter}
            onValueChange={setChampionshipFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por campeonato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os campeonatos</SelectItem>
              {championships.map(championship => (
                <SelectItem key={championship.id} value={championship.id}>
                  {championship.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MatchesFilter;
