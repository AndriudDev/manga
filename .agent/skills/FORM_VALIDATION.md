# Skill: Interactive Form Validation & Visual Feedback

## Requirements for Login Screen
1. **State Management:**
   - Track `email` / `username` and `password`.
   - Track `errors` object (e.g., `{ email?: string, password?: string }`).
   - Track `isSubmitting` and `isLoggedIn` status.

2. **Validation Rules:**
   - Fields cannot be empty upon press of "Ingresar".
   - If empty, set red border on input and display text error below the input.
   - Clear error when user starts typing again.

3. **Visual Feedback:**
   - On successful submit (non-empty fields): Show a success Alert/Modal saying: *"¡Bienvenido a MangaVerse!"*.
   - Add loading state on button while processing.