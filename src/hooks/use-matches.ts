
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Match, Team, Championship } from "@/types";

export const useMatches = () => {
  const [filter, setFilter] = useState("");
  const [championshipFilter, setChampionshipFilter] = useState("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch championships first
        const { data: championshipsData, error: championshipsError } = await supabase
          .from('championships')
          .select('*')
          .order('name');
          
        if (championshipsError) throw championshipsError;
        
        if (championshipsData) {
          setChampionships(championshipsData.map(championship => ({
            id: championship.id,
            name: championship.name,
            logo: championship.logo || "/placeholder.svg",
            country: championship.country,
            teams: []
          })));
        }
        
        // Fetch matches
        const { data: matchesData, error } = await supabase
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
        
        if (error) throw error;
        
        if (matchesData) {
          // We need to fetch teams data to construct complete match objects
          const teamIds = matchesData.flatMap(match => [match.home_team_id, match.away_team_id]);
          const uniqueTeamIds = [...new Set(teamIds)];
          
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', uniqueTeamIds);
            
          if (teamsError) throw teamsError;
          
          // Create a map of team IDs to team objects
          const teamsMap = new Map<string, Team>();
          teamsData?.forEach(team => {
            teamsMap.set(team.id, {
              id: team.id,
              name: team.name,
              logo: team.logo || "/placeholder.svg",
              country: team.country
            });
          });
          
          // Create a map of championship IDs to championship objects
          const championshipsMap = new Map<string, Championship>();
          championshipsData?.forEach(championship => {
            championshipsMap.set(championship.id, {
              id: championship.id,
              name: championship.name,
              logo: championship.logo || "/placeholder.svg",
              country: championship.country,
              teams: []
            });
          });
          
          // Transform raw data into Match objects
          const formattedMatches: Match[] = matchesData.map(match => {
            const homeTeam = teamsMap.get(match.home_team_id) as Team;
            const awayTeam = teamsMap.get(match.away_team_id) as Team;
            
            // Find championship from our map
            const championship = championshipsMap.get(match.championship_id) || {
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
          
          setMatches(formattedMatches);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(filter.toLowerCase()) || 
                         match.awayTeam.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesChampionship = championshipFilter === "all" ? 
                              true : 
                              match.championship.id === championshipFilter;
    
    return matchesSearch && matchesChampionship;
  });

  return {
    filter,
    setFilter,
    championshipFilter,
    setChampionshipFilter,
    matches,
    championships,
    loading,
    filteredMatches
  };
};
