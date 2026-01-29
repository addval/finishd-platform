import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/forms/floating-label-input"
import { PhoneNumberInput } from "@/components/ui/phone-input"
import { useCreateProfile } from "@/features/auth/hooks/useAuth"
import { useAuthForm } from "@/features/auth/hooks/useAuthForm"
import type { ProfileCreationFormData } from "@/features/profile/schemas/profile-creation.schema"
import { profileCreationSchema } from "@/features/profile/schemas/profile-creation.schema"

/**
 * ProfileCreationScreen - react-hook-form + Zod validation
 *
 * Design specs:
 * - Background: #F8F5F2 (warm off-white)
 * - White card: 560px max-width, 12px rounded, 40px padding
 * - Back button top-left
 * - Title: "Create Your Profile" - 20px, bold, #333333, centered
 * - 4 required fields (marked with red asterisk *)
 * - "Continue" button: full-width, black bg, white text, rounded 8px
 */
export function ProfileCreationScreen() {
  const navigate = useNavigate()
  const createProfileMutation = useCreateProfile()

  const handleProfileSubmit = async (data: ProfileCreationFormData) => {
    try {
      await createProfileMutation.mutateAsync(data)
      // At this point, the onSuccess callback has already updated the store
      navigate("/onboarding/permissions")
    } catch (error) {
      // Error is handled by the hook
      console.error("Profile creation failed:", error)
    }
  }

  const { form, isSubmitting } = useAuthForm(profileCreationSchema, handleProfileSubmit)

  return (
    <div className="relative min-h-screen bg-background">
      {/* Main Content - Centered White Card */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-[550px] rounded-md p-10 shadow-lg bg-card"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text-primary">
              Tell us a bit about yourself
            </h2>
          </div>

          {/* Form Fields */}
          <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-6">
            {/* Name Field */}
            <FloatingLabelInput
              label="Name"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message as string | undefined}
              disabled={isSubmitting}
              onClearError={() => form.clearErrors("name")}
            />

            {/* Username Field */}
            <FloatingLabelInput
              label="Username"
              type="text"
              {...form.register("username")}
              error={form.formState.errors.username?.message as string | undefined}
              disabled={isSubmitting}
              onClearError={() => form.clearErrors("username")}
            />

            {/* City Field */}
            <FloatingLabelInput
              label="City"
              type="text"
              {...form.register("city")}
              error={form.formState.errors.city?.message as string | undefined}
              disabled={isSubmitting}
              onClearError={() => form.clearErrors("city")}
            />

            {/* Phone Number Field */}
            <PhoneNumberInput
              countryCode={form.watch("countryCode")}
              onCountryCodeChange={code => form.setValue("countryCode", code)}
              onPhoneNumberChange={phone => form.setValue("phoneNumber", phone)}
              error={form.formState.errors.phoneNumber?.message as string | undefined}
              disabled={isSubmitting}
              placeholder="Enter phone number"
            />

            <div>
              <p className="text-sm text-text-secondary">
                Enter your phone number to make sure you never lose access to your account.
              </p>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} fullWidth>
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
