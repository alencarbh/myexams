import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Coffee, Sun, Moon } from "lucide-react";
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
  morning: "bg-orange-500 text-white",
  afternoon: "bg-red-500 text-white",
  night: "bg-black text-white",
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Próximas Provas</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma prova cadastrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
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
                          <Badge className={shiftColors[exam.shift]}>
                            {(() => {
                              const Icon = shiftIcons[exam.shift];
                              return (
                                <span className="flex items-center gap-1">
                                  <Icon className="h-3 w-3" />
                                  {shiftLabels[exam.shift]}
                                </span>
                              );
                            })()}
                          </Badge>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
