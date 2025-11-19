import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    const labels = ["", "Fraca", "Média", "Forte"];
    const colors = ["", "text-destructive", "text-yellow-500", "text-green-500"];
    
    return {
      score: (score / 3) * 100,
      label: labels[score] || "",
      color: colors[score] || "",
      checks,
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Força da senha:</span>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <Progress value={strength.score} className="h-2" />
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          {strength.checks.length ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={strength.checks.length ? "text-green-500" : "text-muted-foreground"}>
            Mínimo 8 caracteres
          </span>
        </div>
        <div className="flex items-center gap-2">
          {strength.checks.number ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={strength.checks.number ? "text-green-500" : "text-muted-foreground"}>
            Pelo menos 1 número
          </span>
        </div>
        <div className="flex items-center gap-2">
          {strength.checks.special ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={strength.checks.special ? "text-green-500" : "text-muted-foreground"}>
            Pelo menos 1 caractere especial
          </span>
        </div>
      </div>
    </div>
  );
};
