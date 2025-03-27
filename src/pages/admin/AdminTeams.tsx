
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { teams } from "@/lib/mock-data";
import { Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminTeams = () => {
  const { toast } = useToast();
  const [allTeams, setAllTeams] = useState<Team[]>(teams);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: "",
    country: "",
    logo: "/placeholder.svg"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeam.name || !newTeam.country) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && newTeam.id) {
      // Update existing team
      setAllTeams(prev => 
        prev.map(team => team.id === newTeam.id ? { ...newTeam as Team } : team)
      );
      toast({
        title: "Time atualizado",
        description: `${newTeam.name} foi atualizado com sucesso!`
      });
    } else {
      // Add new team
      const id = String(Date.now());
      const teamToAdd = { ...newTeam, id } as Team;
      setAllTeams(prev => [...prev, teamToAdd]);
      toast({
        title: "Time adicionado",
        description: `${newTeam.name} foi adicionado com sucesso!`
      });
    }

    // Reset form and close dialog
    setNewTeam({ name: "", country: "", logo: "/placeholder.svg" });
    setIsEditing(false);
    setOpenDialog(false);
  };

  const handleEdit = (team: Team) => {
    setNewTeam(team);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setAllTeams(prev => prev.filter(team => team.id !== id));
    toast({
      title: "Time removido",
      description: "O time foi removido com sucesso!"
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciar Times</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setNewTeam({ name: "", country: "", logo: "/placeholder.svg" });
                setIsEditing(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Time</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="name">Nome do Time</Label>
                <Input 
                  id="name"
                  name="name"
                  value={newTeam.name}
                  onChange={handleInputChange}
                  placeholder="Nome do time"
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="country">País</Label>
                <Input 
                  id="country"
                  name="country"
                  value={newTeam.country}
                  onChange={handleInputChange}
                  placeholder="País de origem"
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input 
                  id="logo"
                  name="logo"
                  value={newTeam.logo}
                  onChange={handleInputChange}
                  placeholder="URL da imagem do logo"
                />
              </div>
              <Button type="submit" className="w-full">
                {isEditing ? "Atualizar" : "Adicionar"} Time
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
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTeams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    className="h-6 w-6 object-contain" 
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>{team.country}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(team)} className="mr-2">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
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

export default AdminTeams;
