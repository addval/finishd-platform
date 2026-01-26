import { useNavigate } from "react-router-dom"
import { Button } from "@/components/buttons/button"
import { FloatingLabelInput } from "@/components/forms/floating-label-input"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useAuthForm } from "../hooks/useAuthForm"
import { type LoginFormData, loginSchema } from "../schemas/auth.schema"

export function LoginScreen() {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const { form, handleSubmit, isSubmitting, serverError, clearServerError } = useAuthForm(
    loginSchema,
    async (data: LoginFormData) => {
      await login(data.email, data.password)

      // Smart routing based on user completion state
      const user = useAuthStore.getState().user
      if (!user?.emailVerified) {
        navigate("/verify-email")
      } else if (!user?.profileCreated) {
        navigate("/onboarding/profile")
      } else if (!user?.onboardingCompleted) {
        navigate("/onboarding/permissions")
      } else {
        navigate("/")
      }
    },
  )

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F8F5F2" }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-[550px] rounded-md p-10 shadow-lg"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: "#333333" }}>
                  Welcome to Rituality
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
                error={form.formState.errors.email?.message as string | undefined}
                disabled={isSubmitting}
                onChange={() => clearServerError()}
              />

              <FloatingLabelInput
                label="Password"
                type="password"
                required={true}
                {...form.register("password")}
                error={
                  (form.formState.errors.password?.message || serverError) as string | undefined
                }
                disabled={isSubmitting}
                onChange={() => clearServerError()}
              />

              <div className="text-right mb-2">
                <button
                  type="button"
                  onClick={() => alert("Forgot password flow - coming soon!")}
                  className="text-sm underline hover:no-underline focus:outline-none"
                  style={{ color: "#666666" }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-4 mb-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  fullWidth
                >
                  Login
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm" style={{ color: "#666666" }}>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="font-semibold underline hover:no-underline focus:outline-none transition-opacity"
                    style={{ color: "#333333" }}
                  >
                    Sign up
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
