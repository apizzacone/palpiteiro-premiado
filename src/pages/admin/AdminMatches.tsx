
import { useState } from "react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { matches, teams, championships } from "@/lib/mock-data";
import { Match, Team, Championship } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";

interface MatchFormData {
  id?: string;
  homeTeamId: string;
  awayTeamId: string;
  championshipId: string;
  date: Date;
  predictionCost: number;
  prize: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

const AdminMatches = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>(matches);
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: "",
    awayTeamId: "",
    championshipId: "",
    date: new Date(),
    predictionCost: 10,
    prize: "",
    status: "scheduled"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.homeTeamId || !formData.awayTeamId || !formData.championshipId || !formData.prize) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      toast({
        title: "Erro ao salvar",
        description: "Os times da casa e visitante devem ser diferentes",
        variant: "destructive"
      });
      return;
    }

    // Get team and championship objects
    const homeTeam = teams.find(t => t.id === formData.homeTeamId);
    const awayTeam = teams.find(t => t.id === formData.awayTeamId);
    const championship = championships.find(c => c.id === formData.championshipId);

    if (!homeTeam || !awayTeam || !championship) {
      toast({
        title: "Erro ao salvar",
        description: "Time ou campeonato não encontrado",
        variant: "destructive"
      });
      return;
    }

    const matchData: Match = {
      id: formData.id || String(Date.now()),
      homeTeam,
      awayTeam,
      championship,
      date: formData.date,
      status: formData.status,
      predictionCost: formData.predictionCost,
      prize: formData.prize
    };

    if (formData.status !== 'scheduled') {
      matchData.homeScore = formData.homeScore;
      matchData.awayScore = formData.awayScore;
    }

    if (isEditing && formData.id) {
      // Update existing match
      setAllMatches(prev => 
        prev.map(match => match.id === formData.id ? matchData : match)
      );
      toast({
        title: "Partida atualizada",
        description: `Partida entre ${homeTeam.name} e ${awayTeam.name} foi atualizada!`
      });
    } else {
      // Add new match
      setAllMatches(prev => [...prev, matchData]);
      toast({
        title: "Partida adicionada",
        description: `Partida entre ${homeTeam.name} e ${awayTeam.name} foi adicionada!`
      });
    }

    // Reset form and close dialog
    resetForm();
    setOpenDialog(false);
  };

  const handleEdit = (match: Match) => {
    setFormData({
      id: match.id,
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      championshipId: match.championship.id,
      date: match.date,
      predictionCost: match.predictionCost,
      prize: match.prize,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setAllMatches(prev => prev.filter(match => match.id !== id));
    toast({
      title: "Partida removida",
      description: "A partida foi removida com sucesso!"
    });
  };

  const resetForm = () => {
    setFormData({
      homeTeamId: "",
      awayTeamId: "",
      championshipId: "",
      date: new Date(),
      predictionCost: 10,
      prize: "",
      status: "scheduled"
    });
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Partidas</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Partida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Partida</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="homeTeamId">Time da Casa</Label>
                  <Select 
                    value={formData.homeTeamId} 
                    onValueChange={(value) => handleSelectChange("homeTeamId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time da casa" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="awayTeamId">Time Visitante</Label>
                  <Select 
                    value={formData.awayTeamId} 
                    onValueChange={(value) => handleSelectChange("awayTeamId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o time visitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="championshipId">Campeonato</Label>
                <Select 
                  value={formData.championshipId} 
                  onValueChange={(value) => handleSelectChange("championshipId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    {championships.map(championship => (
                      <SelectItem key={championship.id} value={championship.id}>
                        {championship.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label>Data da Partida</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="status">Status da Partida</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value as 'scheduled' | 'live' | 'finished')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="live">Ao vivo</SelectItem>
                    <SelectItem value="finished">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status !== 'scheduled' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="homeScore">Gols do Time da Casa</Label>
                    <Input 
                      id="homeScore"
                      name="homeScore"
                      type="number"
                      min="0"
                      value={formData.homeScore || 0}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="awayScore">Gols do Time Visitante</Label>
                    <Input 
                      id="awayScore"
                      name="awayScore"
                      type="number"
                      min="0"
                      value={formData.awayScore || 0}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="predictionCost">Custo do Palpite (créditos)</Label>
                <Input 
                  id="predictionCost"
                  name="predictionCost"
                  type="number"
                  min="1"
                  value={formData.predictionCost}
                  onChange={handleNumberInputChange}
                  required
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="prize">Prêmio</Label>
                <Input 
                  id="prize"
                  name="prize"
                  value={formData.prize}
                  onChange={handleInputChange}
                  placeholder="Descrição do prêmio"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {isEditing ? "Atualizar" : "Adicionar"} Partida
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          {allMatches.map((match) => (
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
                <Button variant="ghost" size="icon" onClick={() => handleEdit(match)} className="mr-2">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(match.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default AdminMatches;
