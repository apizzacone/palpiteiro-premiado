
import { useState, useEffect } from "react";
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useMatchDetail = (id: string | undefined) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log("Buscando partida com ID:", id);
        
        // Buscar dados da partida
        const { data: matchData, error } = await supabase
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
          .eq('id', id)
          .single();
          
        if (error) {
          console.error("Erro ao buscar partida:", error);
          throw error;
        }
        
        // Buscar dados do time da casa
        const { data: homeTeamData, error: homeTeamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', matchData.home_team_id)
          .single();
          
        if (homeTeamError) throw homeTeamError;
        
        // Buscar dados do time visitante
        const { data: awayTeamData, error: awayTeamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', matchData.away_team_id)
          .single();
          
        if (awayTeamError) throw awayTeamError;
        
        // Buscar dados do campeonato
        const { data: championshipData, error: championshipError } = await supabase
          .from('championships')
          .select('*')
          .eq('id', matchData.championship_id)
          .single();
          
        if (championshipError) throw championshipError;
        
        // Garantir que o status é um dos valores permitidos
        let validStatus: "scheduled" | "live" | "finished" = "scheduled";
        if (matchData.status === "live" || matchData.status === "finished") {
          validStatus = matchData.status;
        }
        
        // Construir o objeto da partida
        const formattedMatch: Match = {
          id: matchData.id,
          homeTeam: {
            id: homeTeamData.id,
            name: homeTeamData.name,
            logo: homeTeamData.logo || "/placeholder.svg",
            country: homeTeamData.country
          },
          awayTeam: {
            id: awayTeamData.id,
            name: awayTeamData.name,
            logo: awayTeamData.logo || "/placeholder.svg",
            country: awayTeamData.country
          },
          championship: {
            id: championshipData.id,
            name: championshipData.name,
            logo: championshipData.logo || "/placeholder.svg",
            country: championshipData.country,
            teams: []
          },
          date: new Date(matchData.date),
          status: validStatus,
          homeScore: matchData.home_score,
          awayScore: matchData.away_score,
          predictionCost: matchData.prediction_cost,
          prize: matchData.prize
        };
        
        setMatch(formattedMatch);
      } catch (error) {
        console.error("Erro em fetchMatch:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatch();
  }, [id]);

  return { match, loading, error };
};
