
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateForm = (email: string, password: string, isSignUp: boolean, fullName?: string) => {
  const errors: string[] = [];
  
  if (!validateEmail(email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!validatePassword(password)) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (isSignUp && !fullName?.trim()) {
    errors.push("Full name is required for registration");
  }
  
  return errors;
};
