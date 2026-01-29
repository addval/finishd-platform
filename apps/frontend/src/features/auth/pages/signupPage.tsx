import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/forms/floating-label-input"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useAuthForm } from "../hooks/useAuthForm"
import { type SignupFormData, signupSchema } from "../schemas/auth.schema"

export function SignupScreen() {
  const navigate = useNavigate()
  const signup = useAuthStore(state => state.signup)

  const { form, handleSubmit, isSubmitting, serverError, clearServerError } = useAuthForm(
    signupSchema,
    async (data: SignupFormData) => {
      await signup(data.email, data.password)
      // Navigate to email verification on success
      navigate("/verify-email", { state: { email: data.email } })
    },
  )

  return (
    <div className="relative min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-[550px] rounded-md p-10 shadow-lg bg-card"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">
                  Get started with Finishd
                </h2>
              </div>

              <div className="text-center mb-8">
                <p>
                  A place to find rituals, people and communities to bring more meaning to your
                  life.
                </p>
              </div>

              <FloatingLabelInput
                label="Email"
                type="email"
                required={true}
                {...form.register("email")}
                error={(form.formState.errors.email?.message || serverError) as string | undefined}
                disabled={isSubmitting}
                onChange={() => clearServerError()}
              />

              <FloatingLabelInput
                label="Password"
                type="password"
                required={true}
                {...form.register("password")}
                error={form.formState.errors.password?.message as string | undefined}
                disabled={isSubmitting}
                onChange={() => clearServerError()}
              />
              <div className="pt-4 mb-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  fullWidth
                >
                  Sign Up
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-text-secondary">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-semibold underline hover:no-underline focus:outline-none transition-opacity text-text-primary"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
