import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Coffee, Sun, Moon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Exam = {
  id: string;
  exam_date: string;
  subject: string;
  shift: "morning" | "afternoon" | "night";
  user_id: string;
  profiles: {
    name: string;
  };
};

const shiftLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite",
};

const shiftColors = {
  morning: "bg-shift-morning text-shift-morning-foreground",
  afternoon: "bg-shift-afternoon text-shift-afternoon-foreground",
  night: "bg-shift-night text-shift-night-foreground",
};

const shiftIcons = {
  morning: Coffee,
  afternoon: Sun,
  night: Moon,
};

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();

    const channel = supabase
      .channel("exams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exams",
        },
        () => {
          fetchExams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        profiles(name)
      `)
      .order("exam_date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar provas");
      console.error(error);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (examId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta prova?")) return;

    const { error } = await supabase.from("exams").delete().eq("id", examId);

    if (error) {
      toast.error("Erro ao excluir prova");
      console.error(error);
    } else {
      toast.success("Prova excluída com sucesso");
      fetchExams();
    }
  };

  const canEdit = (exam: Exam) => {
    return isAdmin || exam.user_id === user?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando provas...</p>
        </div>
      </div>
    );
  }

  const ShiftBadge = ({ shift }: { shift: "morning" | "afternoon" | "night" }) => {
    const Icon = shiftIcons[shift];
    return (
      <Badge className={shiftColors[shift]}>
        <span className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {shiftLabels[shift]}
        </span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl sm:text-2xl">Próximas Provas</CardTitle>
              <Button onClick={() => navigate("/new-exam")}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Prova
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma prova cadastrada ainda.
              </p>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Matéria</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            {format(new Date(exam.exam_date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{exam.profiles.name}</TableCell>
                          <TableCell>{exam.subject}</TableCell>
                          <TableCell>
                            <ShiftBadge shift={exam.shift} />
                          </TableCell>
                          <TableCell className="text-right">
                            {canEdit(exam) && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/edit-exam/${exam.id}`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(exam.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {exams.map((exam) => (
                    <Card key={exam.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground">Data</p>
                              <p className="font-semibold">
                                {format(new Date(exam.exam_date), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <ShiftBadge shift={exam.shift} />
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Colaborador</p>
                            <p className="font-semibold">{exam.profiles.name}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Matéria</p>
                            <p className="font-semibold">{exam.subject}</p>
                          </div>

                          {canEdit(exam) && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(`/edit-exam/${exam.id}`)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleDelete(exam.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
