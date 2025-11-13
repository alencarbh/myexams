import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut, Users, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-gradient-header shadow-elegant sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <Calendar className="h-6 w-6" />
            <h1 className="text-xl font-bold">Calendário de Provas - Estagiários</h1>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              asChild
              className="text-primary-foreground hover:bg-white/20"
            >
              <Link to="/">
                <Calendar className="h-4 w-4 mr-2" />
                Provas
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === "/new-exam" ? "secondary" : "ghost"}
              asChild
              className="text-primary-foreground hover:bg-white/20"
            >
              <Link to="/new-exam">
                <Plus className="h-4 w-4 mr-2" />
                Nova Prova
              </Link>
            </Button>
            
            {isAdmin && (
              <Button
                variant={location.pathname === "/admin" ? "secondary" : "ghost"}
                asChild
                className="text-primary-foreground hover:bg-white/20"
              >
                <Link to="/admin">
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-primary-foreground hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
