import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { addDays, format } from "date-fns";

const examSchema = z.object({
  exam_date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const minDate = addDays(new Date(), 14);
    return selectedDate >= minDate;
  }, "A data da prova deve ter pelo menos 14 dias de antecedência"),
  subject: z.string().min(1, "Matéria é obrigatória").max(128, "Matéria deve ter no máximo 128 caracteres"),
  shift: z.enum(["morning", "afternoon", "night"], {
    required_error: "Selecione um turno",
  }),
});

export default function EditExam() {
  const { id } = useParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [examDate, setExamDate] = useState("");
  const [subject, setSubject] = useState("");
  const [shift, setShift] = useState<"morning" | "afternoon" | "night">();
  const [examUserId, setExamUserId] = useState("");

  const minDate = format(addDays(new Date(), 14), "yyyy-MM-dd");

  useEffect(() => {
    if (!authLoading) {
      fetchExam();
    }
  }, [id, authLoading]);

  const fetchExam = async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao carregar prova");
      navigate("/");
      return;
    }

    // Admins podem editar qualquer prova
    if (!isAdmin && data.user_id !== user.id) {
      toast.error("Você não tem permissão para editar esta prova");
      navigate("/");
      return;
    }

    setExamDate(data.exam_date);
    setSubject(data.subject);
    setShift(data.shift);
    setExamUserId(data.user_id);
    setFetchLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = examSchema.parse({
        exam_date: examDate,
        subject: subject.trim(),
        shift,
      });

      const { error } = await supabase
        .from("exams")
        .update({
          exam_date: validated.exam_date,
          subject: validated.subject,
          shift: validated.shift,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Prova atualizada com sucesso!");
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error("Erro ao atualizar prova");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Editar Prova</CardTitle>
            <CardDescription>
              Altere os dados da prova. A data deve ter pelo menos 14 dias de antecedência.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Data da Prova</Label>
                <Input
                  id="exam-date"
                  type="date"
                  min={minDate}
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Data mínima: {format(new Date(minDate), "dd/MM/yyyy")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Matéria</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Digite o nome da matéria"
                  maxLength={128}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  {subject.length}/128 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Turno</Label>
                <Select
                  value={shift}
                  onValueChange={(value: "morning" | "afternoon" | "night") => setShift(value)}
                  required
                  disabled={loading}
                >
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="night">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
