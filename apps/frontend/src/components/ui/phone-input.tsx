/**
 * Phone Number Input Component
 * An input field for phone numbers with country code support using react-phone-input-2
 */

import { forwardRef } from "react"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

interface PhoneInputProps {
  label?: string
  required?: boolean
  error?: string
  countryCode?: string
  onCountryCodeChange?: (code: string) => void
  onPhoneNumberChange?: (phone: string) => void
  disabled?: boolean
  placeholder?: string
}

export const PhoneNumberInput = forwardRef<typeof PhoneInput, PhoneInputProps>(
  ({
    label: _label,
    required: _required,
    error,
    countryCode = "+1",
    onCountryCodeChange,
    onPhoneNumberChange,
    disabled = false,
    placeholder = "Enter phone number",
  }) => {
    // Handle phone number change
    const handleChange = (value: string, country: { dialCode?: string }) => {
      // Update country code when country changes
      if (country?.dialCode) {
        onCountryCodeChange?.(`+${country.dialCode}`)
      }
      // Update full phone number
      onPhoneNumberChange?.(value)
    }

    return (
      <div className="space-y-1">
        <div className={`phone-input-wrapper ${error ? "has-error" : ""}`}>
          <PhoneInput
            country={"us"}
            value={countryCode}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            inputClass={`
              !flex-1 !px-4 !py-3 !border !rounded-md
              !focus:outline-none !focus:ring-2 !focus:ring-black
              !transition-all !duration-200
              ${error ? "!border-red-500" : "!border-gray-300"}
              ${disabled ? "!opacity-50 !cursor-not-allowed" : ""}
            `}
            inputStyle={{
              paddingLeft: "80px",
            }}
            buttonClass={`
              !rounded-l-md !border !border-r-0
              ${error ? "!border-red-500" : "!border-gray-300"}
              !hover:bg-gray-50 !transition-all
              !px-3 !py-3 !flex-shrink-0
            `}
            dropdownClass={`
              !bg-white !border !border-gray-300 !rounded-md
              !shadow-lg !max-h-100 !overflow-y-auto
              !mt-1 !z-50
            `}
            containerClass="!w-full !flex !items-stretch"
            enableSearch={true}
            disableSearchIcon={false}
            inputProps={{
              name: "phoneNumber",
              required: true,
              autoFocus: false,
            }}
            specialLabel={""}
            searchClass="!px-3 !py-2 !border-b !border-gray-200"
            searchPlaceholder="Search country..."
            countryCodeEditable={false}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  },
)

PhoneNumberInput.displayName = "PhoneNumberInput"
