
import { Football, Trophy, Users } from "lucide-react";

const features = [
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Cadastre-se gratuitamente",
    description: "Crie sua conta gratuita e comece a participar dos palpites em poucos minutos."
  },
  {
    icon: <Football className="w-10 h-10 text-primary" />,
    title: "Faça palpites em partidas",
    description: "Use seus créditos para palpitar nos resultados das partidas de futebol."
  },
  {
    icon: <Trophy className="w-10 h-10 text-primary" />,
    title: "Ganhe prêmios exclusivos",
    description: "Acerte os resultados e ganhe prêmios exclusivos relacionados às partidas."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
          <p className="text-muted-foreground">
            Participe dos palpites de forma simples e concorra a prêmios exclusivos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-8 text-center"
            >
              <div className="bg-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
