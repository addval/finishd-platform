import { useNavigate } from "react-router-dom"

/**
 * WelcomeScreen - Pixel-perfect implementation matching image copy 8.png
 *
 * Design specs:
 * - WHITE HEADER BAR at top (60px height, 100% width, border-bottom)
 * - Background: #F8F5F2 with scattered decorative diamonds
 * - Decorative elements: rotated squares (45deg), sizes 8-12px, varied colors
 * - Centered white card (620px max-width for wider look)
 * - "Finishd" in header: Medium weight (500), 24px, letter-spacing: 0.05em
 */
export function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative Diamond Elements - Scattered rotated squares */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left area */}
        <div
          className="absolute opacity-20 top-[20%] left-[10%] w-2 h-2 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-30 top-[25%] left-[15%] w-2.5 h-2.5 bg-text-secondary rotate-45"
        />

        {/* Top-right area */}
        <div
          className="absolute opacity-15 top-[22%] right-[12%] w-3 h-3 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-40 top-[28%] right-[18%] w-2 h-2 bg-text-secondary rotate-45"
        />

        {/* Middle-left */}
        <div
          className="absolute opacity-25 top-[45%] left-[8%] w-2.5 h-2.5 bg-foreground rotate-45"
        />

        {/* Middle-right */}
        <div
          className="absolute opacity-20 top-[50%] right-[10%] w-2.25 h-2.25 bg-text-secondary rotate-45"
        />
        <div
          className="absolute opacity-30 top-[58%] right-[16%] w-2 h-2 bg-foreground rotate-45"
        />

        {/* Bottom-left */}
        <div
          className="absolute opacity-25 bottom-[25%] left-[12%] w-2.75 h-2.75 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-35 bottom-[30%] left-[20%] w-2 h-2 bg-foreground rotate-45"
        />

        {/* Bottom-right */}
        <div
          className="absolute opacity-20 bottom-[22%] right-[15%] w-2.5 h-2.5 bg-foreground rotate-45"
        />

        {/* Extra scattered diamonds for more visual interest */}
        <div
          className="absolute opacity-15 top-[35%] left-[25%] w-1.5 h-1.5 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-30 top-[40%] right-[25%] w-1.75 h-1.75 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-25 bottom-[35%] left-[18%] w-2.25 h-2.25 bg-foreground rotate-45"
        />
        <div
          className="absolute opacity-20 bottom-[40%] right-[22%] w-2 h-2 bg-foreground rotate-45"
        />
      </div>

      {/* Main Content - Centered White Card */}
      <div
        className="flex items-center justify-center min-h-screen px-4 pt-0"
      >
        <div
          className="w-full max-w-[600px] rounded-md p-10 shadow-lg bg-card"
        >
          {/* Brand Name in Card */}
          <div className="text-center mb-4">
            <h2
              className="text-3xl font-medium uppercase tracking-widest text-text-primary"
            >
              Finishd
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-base text-center leading-relaxed mb-8 text-text-primary">
            Let's personalize your experience so rituals feel more meaningful to you.
          </p>

          {/* Start Exploring Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="w-[280px] h-12 text-base font-medium rounded-lg text-white bg-primary cursor-pointer transition-opacity hover:opacity-90"
            >
              Start exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
