import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut, Users, Plus, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const Header = () => {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Button
        variant={location.pathname === "/" ? "navbarActive" : "navbar"}
        asChild
        onClick={() => setOpen(false)}
      >
        <Link to="/">
          <Calendar className="h-4 w-4 mr-2" />
          Provas
        </Link>
      </Button>
      
      <Button
        variant={location.pathname === "/new-exam" ? "navbarActive" : "navbar"}
        asChild
        onClick={() => setOpen(false)}
      >
        <Link to="/new-exam">
          <Plus className="h-4 w-4 mr-2" />
          Nova Prova
        </Link>
      </Button>
      
      {isAdmin && (
        <Button
          variant={location.pathname === "/admin" ? "navbarActive" : "navbar"}
          asChild
          onClick={() => setOpen(false)}
        >
          <Link to="/admin">
            <Users className="h-4 w-4 mr-2" />
            Admin
          </Link>
        </Button>
      )}
      
      <Button
        variant="navbar"
        onClick={() => {
          signOut();
          setOpen(false);
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </>
  );

  return (
    <header className="bg-gradient-header shadow-elegant sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Calendar className="h-6 w-6" />
            <h1 className="text-lg sm:text-xl font-bold">
              <span className="hidden sm:inline">Calendário de Provas - Estagiários</span>
              <span className="sm:hidden">Provas</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="navbar" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-gradient-header border-none">
              <nav className="flex flex-col gap-3 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
