# Frontend Component Library - Rituality Platform

## 📋 Overview

This document provides a guide to using and customizing the Shadcn/ui component library in the Rituality Platform.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🎨 What is Shadcn/ui?

Shadcn/ui is a collection of **re-usable components** built using Radix UI and Tailwind CSS. Unlike traditional component libraries, Shadcn/ui:

- Copies component code **into your project** (full control)
- Uses **Tailwind CSS** for styling (fully customizable)
- Built on **Radix UI** (accessible, unstyled components)
- No runtime dependencies (just code you own)

---

## 📦 Available Components

### Currently Installed

| Component | Path | Status |
|-----------|------|--------|
| **Button** | `@/components/ui/button` | ✅ Installed |
| **Card** | `@/components/ui/card` | ✅ Installed |
| **Input** | `@/components/ui/input` | ✅ Installed |
| **Label** | `@/components/ui/label` | ✅ Installed |

### Commonly Needed Components (Not Yet Installed)

- Form, Select, Dialog, Dropdown Menu, Toast, Table, Tabs, Badge, Avatar, etc.

---

## 🚀 Adding New Components

### Using CLI (Recommended)

```bash
npx shadcn@latest add [component-name]
```

**Examples**:
```bash
# Add form component
npx shadcn@latest add form

# Add dialog component
npx shadcn@latest add dialog

# Add multiple components
npx shadcn@latest add toast table tabs
```

### Manual Installation

1. Visit [Shadcn/ui Docs](https://ui.shadcn.com/docs/components)
2. Copy component code
3. Create file in `apps/frontend/src/components/ui/`
4. Paste and customize

---

## 📖 Component Usage

### Button

```typescript
import { Button } from "@/components/ui/button"

function Example() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>

      {/* With icon */}
      <Button>
        <Icon name="check" className="mr-2 h-4 w-4" />
        Save
      </Button>
    </div>
  )
}
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ritual Details</CardTitle>
        <CardDescription>View and manage your daily rituals</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your ritual content here...</p>
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
```

### Input

```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Example() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="user@example.com" />

      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" />
    </div>
  )
}
```

---

## 🎨 Customization

### Tailwind CSS v4 Configuration

Located at: `apps/frontend/src/assets/styles/index.css`

```css
@import "tailwindcss";

@theme {
  /* Color palette */
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  --color-secondary: #64748b;
  /* ... more colors */

  /* Border radius */
  --radius: 0.5rem;

  /* Font family */
  --font-sans: "Inter", sans-serif;
}
```

### Component Customization

**Modify component directly** (since code is in your project):

```typescript
// components/ui/button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Add custom variants**:

```typescript
// Add to buttonVariants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        // Add your custom variant
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
      // ...
    }
  }
)
```

---

## 🔧 Common Patterns

### Form with Validation

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <Button type="submit">Login</Button>
    </form>
  )
}
```

---

## 📚 Resources

- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
