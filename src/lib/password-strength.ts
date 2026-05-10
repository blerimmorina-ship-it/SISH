// Client-safe password strength evaluator (no node-only deps).

export function evaluatePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  issues: string[];
} {
  const issues: string[] = [];
  if (password.length < 8) issues.push("Të paktën 8 karaktere");
  if (!/[A-Z]/.test(password)) issues.push("Një shkronjë e madhe");
  if (!/[a-z]/.test(password)) issues.push("Një shkronjë e vogël");
  if (!/\d/.test(password)) issues.push("Një numër");
  if (!/[^a-zA-Z0-9]/.test(password)) issues.push("Një karakter special");

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;

  const labels = ["Shumë i dobët", "I dobët", "I mesatar", "I fortë", "Shumë i fortë"];
  return {
    score: Math.min(4, score) as 0 | 1 | 2 | 3 | 4,
    label: labels[Math.min(4, score)]!,
    issues,
  };
}
