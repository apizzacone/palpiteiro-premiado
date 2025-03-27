
import { useState, useEffect } from "react";
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
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminTeams = () => {
  const { toast } = useToast();
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: "",
    country: "",
    logo: "/placeholder.svg"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch teams from Supabase
  useEffect(() => {
    fetchTeams();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:teams')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'teams' 
      }, (payload) => {
        console.log('Realtime change:', payload);
        fetchTeams();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      console.log('Teams data:', data);
      
      // Transform data to match Team type if needed
      const teamsData: Team[] = data?.map(team => ({
        id: team.id,
        name: team.name,
        country: team.country,
        logo: team.logo || "/placeholder.svg"
      })) || [];
      
      setAllTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro ao carregar times",
        description: "Houve um problema ao carregar os times. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeam.name || !newTeam.country) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);

    try {
      if (isEditing && newTeam.id) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
          .update({
            name: newTeam.name,
            country: newTeam.country,
            logo: newTeam.logo || "/placeholder.svg"
          })
          .eq('id', newTeam.id);
          
        if (error) throw error;
        
        toast({
          title: "Time atualizado",
          description: `${newTeam.name} foi atualizado com sucesso!`
        });
      } else {
        // Add new team
        const { error } = await supabase
          .from('teams')
          .insert({
            name: newTeam.name,
            country: newTeam.country,
            logo: newTeam.logo || "/placeholder.svg"
          });
          
        if (error) throw error;
        
        toast({
          title: "Time adicionado",
          description: `${newTeam.name} foi adicionado com sucesso!`
        });
      }

      // Reset form and close dialog
      setNewTeam({ name: "", country: "", logo: "/placeholder.svg" });
      setIsEditing(false);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o time. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (team: Team) => {
    setNewTeam(team);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Time removido",
        description: "O time foi removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover o time. Tente novamente.",
        variant: "destructive"
      });
    }
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
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{isEditing ? "Atualizar" : "Adicionar"} Time</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando times...</span>
        </div>
      ) : (
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
            {allTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Nenhum time encontrado. Adicione seu primeiro time.
                </TableCell>
              </TableRow>
            ) : (
              allTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      <img 
                        src={team.logo} 
                        alt={team.name} 
                        className="h-6 w-6 object-contain" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
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
              ))
            )}
          </TableBody>
        </Table>
      )}
    </AdminLayout>
  );
};

export default AdminTeams;
