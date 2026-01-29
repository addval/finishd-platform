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
    <div className="relative min-h-screen" style={{ backgroundColor: "#F8F5F2" }}>
      {/* Decorative Diamond Elements - Scattered rotated squares */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left area */}
        <div
          className="absolute opacity-20"
          style={{
            top: "20%",
            left: "10%",
            width: "8px",
            height: "8px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-30"
          style={{
            top: "25%",
            left: "15%",
            width: "10px",
            height: "10px",
            backgroundColor: "#666666",
            transform: "rotate(45deg)",
          }}
        />

        {/* Top-right area */}
        <div
          className="absolute opacity-15"
          style={{
            top: "22%",
            right: "12%",
            width: "12px",
            height: "12px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-40"
          style={{
            top: "28%",
            right: "18%",
            width: "8px",
            height: "8px",
            backgroundColor: "#666666",
            transform: "rotate(45deg)",
          }}
        />

        {/* Middle-left */}
        <div
          className="absolute opacity-25"
          style={{
            top: "45%",
            left: "8%",
            width: "10px",
            height: "10px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />

        {/* Middle-right */}
        <div
          className="absolute opacity-20"
          style={{
            top: "50%",
            right: "10%",
            width: "9px",
            height: "9px",
            backgroundColor: "#666666",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-30"
          style={{
            top: "58%",
            right: "16%",
            width: "8px",
            height: "8px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />

        {/* Bottom-left */}
        <div
          className="absolute opacity-25"
          style={{
            bottom: "25%",
            left: "12%",
            width: "11px",
            height: "11px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-35"
          style={{
            bottom: "30%",
            left: "20%",
            width: "8px",
            height: "8px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />

        {/* Bottom-right */}
        <div
          className="absolute opacity-20"
          style={{
            bottom: "22%",
            right: "15%",
            width: "10px",
            height: "10px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />

        {/* Extra scattered diamonds for more visual interest */}
        <div
          className="absolute opacity-15"
          style={{
            top: "35%",
            left: "25%",
            width: "6px",
            height: "6px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-30"
          style={{
            top: "40%",
            right: "25%",
            width: "7px",
            height: "7px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-25"
          style={{
            bottom: "35%",
            left: "18%",
            width: "9px",
            height: "9px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
        <div
          className="absolute opacity-20"
          style={{
            bottom: "40%",
            right: "22%",
            width: "8px",
            height: "8px",
            backgroundColor: "#000000",
            transform: "rotate(45deg)",
          }}
        />
      </div>

      {/* Main Content - Centered White Card */}
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{ paddingTop: "0" }}
      >
        <div
          className="w-full max-w-[600px] rounded-md p-10 shadow-lg"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {/* Brand Name in Card */}
          <div className="text-center mb-4">
            <h2
              className="text-3xl font-bold uppercase tracking-wider"
              style={{
                color: "#333333",
                fontFamily:
                  "var(--font-family-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif)",
                fontWeight: "500",
                letterSpacing: "0.1em",
              }}
            >
              Finishd
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-base text-center leading-relaxed mb-8" style={{ color: "#333333" }}>
            Let's personalize your experience so rituals feel more meaningful to you.
          </p>

          {/* Start Exploring Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="w-[280px] h-12 text-base font-medium rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#000000", cursor: "pointer" }}
            >
              Start exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
