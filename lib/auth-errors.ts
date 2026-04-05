export function getAuthErrorMessage(error: any): string {
  const code = error?.code || error?.message || '';
  
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection and try again.';
    default:
      if (typeof code === 'string' && code.startsWith('auth/')) {
        return 'An authentication error occurred. Please try again.';
      }
      return error?.message || 'An unexpected error occurred.';
  }
}
