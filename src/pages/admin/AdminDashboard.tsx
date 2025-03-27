
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    teams: 0,
    championships: 0,
    matches: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch team count
        const { count: teamsCount, error: teamsError } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });
        
        if (teamsError) throw teamsError;
        
        // Fetch championship count
        const { count: championshipsCount, error: championshipsError } = await supabase
          .from('championships')
          .select('*', { count: 'exact', head: true });
        
        if (championshipsError) throw championshipsError;
        
        // Fetch matches count
        const { count: matchesCount, error: matchesError } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true });
        
        if (matchesError) throw matchesError;
        
        setDashboardData({
          teams: teamsCount || 0,
          championships: championshipsCount || 0,
          matches: matchesCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Times</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.teams}</div>
              <p className="text-xs text-muted-foreground">
                Times cadastrados no sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campeonatos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.championships}</div>
              <p className="text-xs text-muted-foreground">
                Campeonatos cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.matches}</div>
              <p className="text-xs text-muted-foreground">
                Partidas programadas
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
