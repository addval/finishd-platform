/**
 * API Response Messages
 * Centralized message constants for consistent API responses
 * Matches reference backend pattern
 */

export const MESSAGES = {
  // Generic success messages
  SUCCESS: {
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    FETCHED: "Resource fetched successfully",
  },

  // Generic error messages
  ERROR: {
    NOT_FOUND: "Resource not found",
    ALREADY_EXISTS: "Resource already exists",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_SERVER: "Internal server error",
    INVALID_INPUT: "Invalid input provided",
    REQUIRED_FIELD: "Required field is missing",
  },

  // Authentication messages
  AUTH: {
    REGISTER_SUCCESS: "Registration successful. Please check your email to verify your account.",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    EMAIL_VERIFIED: "Email verified successfully",
    EMAIL_ALREADY_VERIFIED: "Email is already verified",
    PASSWORD_RESET: "Password reset successful",
    PASSWORD_RESET_EMAIL_SENT: "Password reset email sent",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_VERIFICATION_CODE: "Invalid verification code",
    VERIFICATION_CODE_EXPIRED: "Verification code has expired. Please request a new one.",
    VERIFICATION_EMAIL_SENT: "Verification email sent successfully",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_TOKEN: "Invalid token",
    SESSION_EXPIRED: "Session has expired",
  },

  // User messages
  USER: {
    PROFILE_CREATED: "Profile created successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    PROFILE_FETCHED: "Profile fetched successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    PASSWORD_SAME: "New password cannot be same as old password",
    ACCOUNT_INACTIVE: "Account is not active",
    ACCOUNT_DELETED: "Account deleted successfully",
    PERMISSION_SETTINGS_CREATED: "Permission settings created successfully",
    PERMISSION_SETTINGS_UPDATED: "Permission settings updated successfully",
    PERMISSION_SETTINGS_FETCHED: "Permission settings fetched successfully",
  },

  // Onboarding messages
  ONBOARDING: {
    COMPLETED: "Onboarding completed successfully",
    NOT_COMPLETED: "Please complete onboarding to continue",
    STEP_COMPLETED: "Onboarding step completed",
  },

  // Rate limiting messages
  RATE_LIMIT: {
    EXCEEDED: "Too many requests. Please try again later.",
  },
} as const
