
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useMatchDetail } from "@/hooks/use-match-detail";
import LoadingMatchDetail from "@/components/match/LoadingMatchDetail";
import MatchHeader from "@/components/match/MatchHeader";
import MatchInfo from "@/components/match/MatchInfo";
import MatchPredictionForm from "@/components/match/MatchPredictionForm";
import { Card, CardContent } from "@/components/ui/card";

const MatchDetail = () => {
  const { id } = useParams();
  const { match, loading, error } = useMatchDetail(id);

  if (loading) {
    return (
      <Layout>
        <LoadingMatchDetail />
      </Layout>
    );
  }

  if (error || !match) {
    return <Navigate to="/matches" replace />;
  }
  
  // Ensure we have a valid status
  const validStatus = ["scheduled", "live", "finished"].includes(match.status) 
    ? match.status as "scheduled" | "live" | "finished"
    : "scheduled";
    
  // Create a new match object with the validated status
  const validatedMatch = {
    ...match,
    status: validStatus
  };
  
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card overflow-hidden animate-fade-up">
              <div className="bg-secondary p-6">
                <MatchHeader match={validatedMatch} />
              </div>
              
              <CardContent className="p-8">
                <MatchInfo match={validatedMatch} />
                <MatchPredictionForm match={validatedMatch} />
              </CardContent>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MatchDetail;
