
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
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Championship, Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminChampionships = () => {
  const { toast } = useToast();
  const [allChampionships, setAllChampionships] = useState<Championship[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [newChampionship, setNewChampionship] = useState<Partial<Championship>>({
    name: "",
    country: "",
    logo: "/placeholder.svg",
    teams: []
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch championships from database
  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teams first
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('name');
          
        if (teamsError) throw teamsError;
        
        const formattedTeams: Team[] = teamsData?.map(team => ({
          id: team.id,
          name: team.name,
          country: team.country,
          logo: team.logo || "/placeholder.svg"
        })) || [];
        
        setAllTeams(formattedTeams);
        
        // Fetch championships
        const { data: championshipsData, error: championshipsError } = await supabase
          .from('championships')
          .select('*')
          .order('name');
          
        if (championshipsError) throw championshipsError;
        
        if (championshipsData) {
          // For each championship, fetch its teams
          const formattedChampionships: Championship[] = await Promise.all(
            championshipsData.map(async (championship) => {
              // Fetch teams for this championship
              const { data: teamData, error: teamError } = await supabase
                .from('championship_teams')
                .select(`
                  team_id,
                  teams:team_id (
                    id,
                    name,
                    country,
                    logo
                  )
                `)
                .eq('championship_id', championship.id);
                
              if (teamError) throw teamError;
              
              const teams = teamData?.map(item => ({
                id: item.teams.id,
                name: item.teams.name,
                country: item.teams.country,
                logo: item.teams.logo || "/placeholder.svg"
              })) || [];
              
              return {
                id: championship.id,
                name: championship.name,
                country: championship.country,
                logo: championship.logo || "/placeholder.svg",
                teams: teams
              };
            })
          );
          
          setAllChampionships(formattedChampionships);
        }
      } catch (error) {
        console.error('Error fetching championships:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os campeonatos. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChampionships();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewChampionship(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChampionship.name || !newChampionship.country) {
      toast({
        title: "Erro ao salvar",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Get selected team objects for UI
      const selectedTeamObjects = allTeams.filter(team => 
        selectedTeams.includes(team.id)
      );

      const championshipData = {
        name: newChampionship.name,
        country: newChampionship.country,
        logo: newChampionship.logo
      };

      if (isEditing && newChampionship.id) {
        // Update existing championship
        const { error } = await supabase
          .from('championships')
          .update(championshipData)
          .eq('id', newChampionship.id);
          
        if (error) throw error;
        
        // Delete existing team relationships
        const { error: deleteError } = await supabase
          .from('championship_teams')
          .delete()
          .eq('championship_id', newChampionship.id);
          
        if (deleteError) throw deleteError;
        
        // Insert new team relationships
        if (selectedTeams.length > 0) {
          const teamRelationships = selectedTeams.map(teamId => ({
            championship_id: newChampionship.id,
            team_id: teamId
          }));
          
          const { error: insertError } = await supabase
            .from('championship_teams')
            .insert(teamRelationships);
            
          if (insertError) throw insertError;
        }
        
        // Update UI
        setAllChampionships(prev => 
          prev.map(championship => 
            championship.id === newChampionship.id 
              ? { ...championship, ...championshipData, teams: selectedTeamObjects } 
              : championship
          )
        );
        
        toast({
          title: "Campeonato atualizado",
          description: `${newChampionship.name} foi atualizado com sucesso!`
        });
      } else {
        // Add new championship
        const { data, error } = await supabase
          .from('championships')
          .insert(championshipData)
          .select('id')
          .single();
          
        if (error) throw error;
        
        // Insert team relationships
        if (selectedTeams.length > 0) {
          const teamRelationships = selectedTeams.map(teamId => ({
            championship_id: data.id,
            team_id: teamId
          }));
          
          const { error: insertError } = await supabase
            .from('championship_teams')
            .insert(teamRelationships);
            
          if (insertError) throw insertError;
        }
        
        // Update UI
        const newChamp: Championship = {
          id: data.id,
          name: newChampionship.name!,
          country: newChampionship.country!,
          logo: newChampionship.logo || "/placeholder.svg",
          teams: selectedTeamObjects
        };
        
        setAllChampionships(prev => [...prev, newChamp]);
        
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
    } catch (error) {
      console.error('Error saving championship:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o campeonato. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (championship: Championship) => {
    setNewChampionship(championship);
    setSelectedTeams(championship.teams.map(team => team.id));
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete championship (cascade will delete championship_teams entries)
      const { error } = await supabase
        .from('championships')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update UI
      setAllChampionships(prev => prev.filter(championship => championship.id !== id));
      
      toast({
        title: "Campeonato removido",
        description: "O campeonato foi removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting championship:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover o campeonato. Tente novamente.",
        variant: "destructive"
      });
    }
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label>Times Participantes</Label>
                <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                  {allTeams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`team-${team.id}`} 
                        checked={selectedTeams.includes(team.id)}
                        onCheckedChange={() => toggleTeam(team.id)}
                        disabled={isSaving}
                      />
                      <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                        {team.name} ({team.country})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Adicionar"} Campeonato
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando campeonatos...</span>
        </div>
      ) : (
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
            {allChampionships.length > 0 ? (
              allChampionships.map((championship) => (
                <TableRow key={championship.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      <img 
                        src={championship.logo} 
                        alt={championship.name} 
                        className="h-6 w-6 object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum campeonato cadastrado. Clique em "Adicionar Campeonato" para cadastrar.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </AdminLayout>
  );
};

export default AdminChampionships;
