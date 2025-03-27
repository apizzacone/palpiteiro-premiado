
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Match, Team, Championship } from "@/types";
import { championships } from "@/lib/mock-data";

export interface MatchFormData {
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

const defaultFormData: MatchFormData = {
  homeTeamId: "",
  awayTeamId: "",
  championshipId: "",
  date: new Date(),
  predictionCost: 10,
  prize: "",
  status: "scheduled"
};

export const useAdminMatches = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [formData, setFormData] = useState<MatchFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  // Fetch matches from the database
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');
          
        if (teamsError) throw teamsError;
        
        const teamsMap = new Map<string, Team>();
        const formattedTeams: Team[] = teamsData?.map(team => {
          const teamObj = {
            id: team.id,
            name: team.name,
            country: team.country,
            logo: team.logo || "/placeholder.svg"
          };
          teamsMap.set(team.id, teamObj);
          return teamObj;
        }) || [];
        
        setAllTeams(formattedTeams);
        
        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            id,
            date,
            prediction_cost,
            prize,
            status,
            home_score,
            away_score,
            championship_id,
            home_team_id,
            away_team_id
          `)
          .order('date');
        
        if (matchesError) throw matchesError;
        
        if (matchesData) {
          // Transform raw data into Match objects
          const formattedMatches: Match[] = matchesData.map(match => {
            const homeTeam = teamsMap.get(match.home_team_id) as Team;
            const awayTeam = teamsMap.get(match.away_team_id) as Team;
            
            // Find championship from mock data for now
            const championship = championships.find(c => c.id === match.championship_id) || {
              id: match.championship_id,
              name: "Campeonato",
              logo: "/placeholder.svg",
              country: "Brasil",
              teams: []
            };
            
            return {
              id: match.id,
              homeTeam,
              awayTeam,
              championship,
              date: new Date(match.date),
              status: match.status as 'scheduled' | 'live' | 'finished',
              homeScore: match.home_score,
              awayScore: match.away_score,
              predictionCost: match.prediction_cost,
              prize: match.prize
            };
          });
          
          setAllMatches(formattedMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: "Erro ao carregar partidas",
          description: "Não foi possível carregar as partidas. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, [toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      setIsSaving(true);
      
      // Get team and championship objects for UI
      const homeTeam = allTeams.find(t => t.id === formData.homeTeamId);
      const awayTeam = allTeams.find(t => t.id === formData.awayTeamId);
      const championship = championships.find(c => c.id === formData.championshipId);

      if (!homeTeam || !awayTeam || !championship) {
        throw new Error("Time ou campeonato não encontrado");
      }

      // Prepare data for database
      const matchData = {
        home_team_id: formData.homeTeamId,
        away_team_id: formData.awayTeamId,
        championship_id: formData.championshipId,
        date: formData.date.toISOString(),
        prediction_cost: formData.predictionCost,
        prize: formData.prize,
        status: formData.status,
        home_score: formData.status !== 'scheduled' ? formData.homeScore : null,
        away_score: formData.status !== 'scheduled' ? formData.awayScore : null
      };

      // Create full object for UI
      const uiMatchData: Match = {
        id: formData.id || "",
        homeTeam,
        awayTeam,
        championship,
        date: formData.date,
        status: formData.status,
        predictionCost: formData.predictionCost,
        prize: formData.prize
      };

      if (formData.status !== 'scheduled') {
        uiMatchData.homeScore = formData.homeScore;
        uiMatchData.awayScore = formData.awayScore;
      }

      if (isEditing && formData.id) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', formData.id);
          
        if (error) throw error;
        
        // Update UI
        setAllMatches(prev => 
          prev.map(match => match.id === formData.id ? { ...uiMatchData, id: formData.id! } : match)
        );
        
        toast({
          title: "Partida atualizada",
          description: `Partida entre ${homeTeam.name} e ${awayTeam.name} foi atualizada!`
        });
      } else {
        // Add new match
        const { data, error } = await supabase
          .from('matches')
          .insert(matchData)
          .select('id')
          .single();
          
        if (error) throw error;
        
        // Update UI with the new ID
        setAllMatches(prev => [...prev, { ...uiMatchData, id: data.id }]);
        
        toast({
          title: "Partida adicionada",
          description: `Partida entre ${homeTeam.name} e ${awayTeam.name} foi adicionada!`
        });
      }

      // Reset form and close dialog
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a partida. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setAllMatches(prev => prev.filter(match => match.id !== id));
      
      toast({
        title: "Partida removida",
        description: "A partida foi removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover a partida. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsEditing(false);
  };

  return {
    allMatches,
    formData,
    isEditing,
    openDialog,
    setOpenDialog,
    isLoading,
    isSaving,
    allTeams,
    handleInputChange,
    handleNumberInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm
  };
};
