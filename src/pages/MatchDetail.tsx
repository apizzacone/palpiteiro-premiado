
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
  
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card overflow-hidden animate-fade-up">
              <div className="bg-secondary p-6">
                <MatchHeader match={match} />
              </div>
              
              <CardContent className="p-8">
                <MatchInfo match={match} />
                <MatchPredictionForm match={match} />
              </CardContent>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MatchDetail;
