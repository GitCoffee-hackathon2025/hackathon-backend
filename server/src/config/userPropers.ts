export function regexPassword(password: string) {
  const errors: string[] = [];

  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
  if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúsculo';
  if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula';
  if (!/\d/.test(password)) return 'A senha deve conter pelo menos um número';
}

export const regexEmail = /^[\w.+-]+@\S+\.[a-zA-Z]{2,}$/;
