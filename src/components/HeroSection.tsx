
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-background z-0" />
      
      <div className="container mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Faça seus palpites e ganhe prêmios exclusivos
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              Participe de palpites em partidas de futebol e concorra a prêmios relacionados aos seus times favoritos.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button size="lg" asChild>
                <Link to="/matches">Ver partidas</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Criar conta</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10" />
              <img 
                src="/placeholder.svg" 
                alt="Palpiteiro Premiado" 
                className="w-full h-full object-cover z-0" 
              />
            </div>
            
            <div className="absolute top-4 right-4 glass-morphism rounded-lg p-4 max-w-[200px] animate-fade-in opacity-80 hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium">Já são mais de 1.000 prêmios entregues para nossos participantes!</p>
            </div>
            
            <div className="absolute -bottom-6 -left-6 glass-morphism rounded-lg p-4 animate-fade-in shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-success rounded-full w-10 h-10 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Acaba de ganhar</p>
                  <p className="text-xs text-muted-foreground">Rafael ganhou uma camisa oficial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
