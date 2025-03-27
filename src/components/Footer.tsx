
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12 mt-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-primary font-bold text-xl mb-4">Palpiteiro Premiado</h3>
            <p className="text-muted-foreground text-sm">
              A melhor plataforma para palpites de futebol com prêmios exclusivos.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Início</Link></li>
              <li><Link to="/matches" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Partidas</Link></li>
              <li><Link to="/teams" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Times</Link></li>
              <li><Link to="/championships" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Campeonatos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Conta</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Entrar</Link></li>
              <li><Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Cadastrar</Link></li>
              <li><Link to="/account" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Minha Conta</Link></li>
              <li><Link to="/credits" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Comprar Créditos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">contato@palpiteiropremiado.com</li>
              <li className="text-muted-foreground text-sm">+55 (11) 99999-9999</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Palpiteiro Premiado. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Termos</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
