
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { championships, teams } from "@/lib/mock-data";
import { Championship, Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminChampionships = () => {
  const { toast } = useToast();
  const [allChampionships, setAllChampionships] = useState<Championship[]>(championships);
  const [newChampionship, setNewChampionship] = useState<Partial<Championship>>({
    name: "",
    country: "",
    logo: "/placeholder.svg",
    teams: []
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewChampionship(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChampionship.name || !newChampionship.country) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Get selected teams objects
    const selectedTeamObjects = teams.filter(team => 
      selectedTeams.includes(team.id)
    );

    const championshipData = {
      ...newChampionship,
      teams: selectedTeamObjects
    };

    if (isEditing && newChampionship.id) {
      // Update existing championship
      setAllChampionships(prev => 
        prev.map(championship => 
          championship.id === newChampionship.id 
            ? championshipData as Championship 
            : championship
        )
      );
      toast({
        title: "Campeonato atualizado",
        description: `${newChampionship.name} foi atualizado com sucesso!`
      });
    } else {
      // Add new championship
      const id = String(Date.now());
      const championshipToAdd = { ...championshipData, id } as Championship;
      setAllChampionships(prev => [...prev, championshipToAdd]);
      toast({
        title: "Campeonato adicionado",
        description: `${newChampionship.name} foi adicionado com sucesso!`
      });
    }

    // Reset form and close dialog
    setNewChampionship({ name: "", country: "", logo: "/placeholder.svg", teams: [] });
    setSelectedTeams([]);
    setIsEditing(false);
    setOpenDialog(false);
  };

  const handleEdit = (championship: Championship) => {
    setNewChampionship(championship);
    setSelectedTeams(championship.teams.map(team => team.id));
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setAllChampionships(prev => prev.filter(championship => championship.id !== id));
    toast({
      title: "Campeonato removido",
      description: "O campeonato foi removido com sucesso!"
    });
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Campeonatos</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setNewChampionship({ name: "", country: "", logo: "/placeholder.svg", teams: [] });
                setSelectedTeams([]);
                setIsEditing(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Campeonato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Campeonato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="name">Nome do Campeonato</Label>
                <Input 
                  id="name"
                  name="name"
                  value={newChampionship.name}
                  onChange={handleInputChange}
                  placeholder="Nome do campeonato"
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="country">País</Label>
                <Input 
                  id="country"
                  name="country"
                  value={newChampionship.country}
                  onChange={handleInputChange}
                  placeholder="País do campeonato"
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input 
                  id="logo"
                  name="logo"
                  value={newChampionship.logo}
                  onChange={handleInputChange}
                  placeholder="URL da imagem do logo"
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label>Times Participantes</Label>
                <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`team-${team.id}`} 
                        checked={selectedTeams.includes(team.id)}
                        onCheckedChange={() => toggleTeam(team.id)}
                      />
                      <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                        {team.name} ({team.country})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {isEditing ? "Atualizar" : "Adicionar"} Campeonato
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Times</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allChampionships.map((championship) => (
            <TableRow key={championship.id}>
              <TableCell>
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  <img 
                    src={championship.logo} 
                    alt={championship.name} 
                    className="h-6 w-6 object-contain" 
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{championship.name}</TableCell>
              <TableCell>{championship.country}</TableCell>
              <TableCell>{championship.teams.length} times</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(championship)} className="mr-2">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(championship.id)}>
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

export default AdminChampionships;
