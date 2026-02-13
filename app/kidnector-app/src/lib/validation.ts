export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain at least one letter and one number' };
  }
  
  return { isValid: true };
}

export function validateParentName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  return { isValid: true };
}

export function validateChildName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: "Child's name is required" };
  }
  
  if (name.trim().length < 1) {
    return { isValid: false, error: "Child's name cannot be empty" };
  }
  
  if (name.trim().length > 30) {
    return { isValid: false, error: "Child's name is too long" };
  }
  
  return { isValid: true };
}

export function validateChildAge(age: string): ValidationResult {
  if (!age.trim()) {
    return { isValid: false, error: 'Age is required' };
  }
  
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    return { isValid: false, error: 'Please enter a valid age' };
  }
  
  if (ageNum < 3) {
    return { isValid: false, error: 'Age must be at least 3 years' };
  }
  
  if (ageNum > 18) {
    return { isValid: false, error: 'Age must be 18 or younger' };
  }
  
  return { isValid: true };
}

export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
}

export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}