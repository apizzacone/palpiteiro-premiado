
import { useState, useEffect } from "react";
import { Match } from "@/types";
import { matches } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

export const useMatchDetail = (id: string | undefined) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        console.log("Fetching match with ID:", id);
        
        // First attempt to get match from mock data for development
        const mockMatch = matches.find(m => m.id === id);
        if (mockMatch) {
          setMatch(mockMatch);
          setLoading(false);
          return;
        }
        
        // If mock match not found, try to fetch from Supabase
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
          console.error("Error fetching match:", error);
          throw error;
        }
        
        // Get teams data
        const { data: homeTeamData, error: homeTeamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', matchData.home_team_id)
          .single();
          
        if (homeTeamError) throw homeTeamError;
        
        const { data: awayTeamData, error: awayTeamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', matchData.away_team_id)
          .single();
          
        if (awayTeamError) throw awayTeamError;
        
        // Get championship data
        const { data: championshipData, error: championshipError } = await supabase
          .from('championships')
          .select('*')
          .eq('id', matchData.championship_id)
          .single();
          
        if (championshipError) throw championshipError;
        
        // Ensure status is one of the allowed values
        let validStatus: "scheduled" | "live" | "finished" = "scheduled";
        if (matchData.status === "live" || matchData.status === "finished") {
          validStatus = matchData.status;
        }
        
        // Construct match object
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
        console.error("Error in fetchMatch:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchMatch();
    }
  }, [id]);

  return { match, loading, error };
};
