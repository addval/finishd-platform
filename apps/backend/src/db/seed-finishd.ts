/**
 * Finishd Seed Data
 * Creates test data for development and testing
 *
 * Run with: pnpm db:seed:finishd
 *
 * Creates:
 * - 10 homeowners with properties
 * - 6 interior designers (4 verified)
 * - 4 contractors (3 verified)
 * - Projects in all states
 * - Sample requests, proposals, tasks, milestones
 */

import dotenv from "dotenv"
dotenv.config()

import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from "./schema.js"

const { Pool } = pg

// Create pool with loaded env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const db = drizzle(pool, { schema })

const {
  users,
  homeownerProfiles,
  designerProfiles,
  contractorProfiles,
  properties,
  projects,
  projectRequests,
  proposals,
  tasks,
  milestones,
  costEstimates,
} = schema

// ============================================================================
// SEED DATA
// ============================================================================

const CITIES = ["Delhi", "Gurgaon", "Noida", "Chandigarh", "Mohali", "Panchkula"]
const LOCALITIES = {
  Delhi: ["South Delhi", "Dwarka", "Vasant Kunj", "Greater Kailash"],
  Gurgaon: ["DLF Phase 1", "Sohna Road", "Golf Course Road", "Sector 56"],
  Noida: ["Sector 62", "Sector 137", "Sector 50", "Greater Noida"],
  Chandigarh: ["Sector 17", "Sector 35", "Sector 22", "IT Park"],
  Mohali: ["Phase 7", "Phase 11", "Sector 70", "Airport Road"],
  Panchkula: ["Sector 12", "Sector 20", "Sector 4", "MDC"],
}

const DESIGN_STYLES = ["Contemporary", "Modern", "Traditional", "Minimalist", "Industrial", "Scandinavian"]
const TRADES = ["electrician", "plumber", "mason", "carpenter", "painter", "general_contractor"]

// Homeowner data
const homeownerData = [
  { name: "Rajesh Kumar", phone: "9876543210", city: "Delhi", locality: "South Delhi" },
  { name: "Priya Sharma", phone: "9876543211", city: "Gurgaon", locality: "DLF Phase 1" },
  { name: "Amit Patel", phone: "9876543212", city: "Noida", locality: "Sector 62" },
  { name: "Sunita Verma", phone: "9876543213", city: "Chandigarh", locality: "Sector 17" },
  { name: "Vikram Singh", phone: "9876543214", city: "Mohali", locality: "Phase 7" },
  { name: "Neha Gupta", phone: "9876543215", city: "Delhi", locality: "Dwarka" },
  { name: "Rohit Malhotra", phone: "9876543216", city: "Gurgaon", locality: "Golf Course Road" },
  { name: "Anita Reddy", phone: "9876543217", city: "Noida", locality: "Sector 137" },
  { name: "Sanjay Joshi", phone: "9876543218", city: "Panchkula", locality: "Sector 12" },
  { name: "Meera Kapoor", phone: "9876543219", city: "Chandigarh", locality: "Sector 35" },
]

// Designer data
const designerData = [
  {
    name: "Arjun Design Studio",
    firmName: "Arjun Interiors",
    phone: "9876543220",
    bio: "Award-winning interior design firm with 15 years of experience in luxury residential projects.",
    styles: ["Contemporary", "Modern", "Minimalist"],
    cities: ["Delhi", "Gurgaon", "Noida"],
    priceMin: 500000,
    priceMax: 5000000,
    experience: 15,
    verified: true,
  },
  {
    name: "Kavita Designs",
    firmName: "KD Interiors",
    phone: "9876543221",
    bio: "Specializing in modern apartments and villas with sustainable design practices.",
    styles: ["Modern", "Scandinavian", "Minimalist"],
    cities: ["Gurgaon", "Delhi"],
    priceMin: 300000,
    priceMax: 2000000,
    experience: 8,
    verified: true,
  },
  {
    name: "Traditional Homes by Ravi",
    firmName: "Ravi & Associates",
    phone: "9876543222",
    bio: "Bringing traditional Indian aesthetics to modern homes.",
    styles: ["Traditional", "Contemporary"],
    cities: ["Chandigarh", "Mohali", "Panchkula"],
    priceMin: 200000,
    priceMax: 1500000,
    experience: 12,
    verified: true,
  },
  {
    name: "Urban Space Designers",
    firmName: "Urban Space",
    phone: "9876543223",
    bio: "Creating functional and beautiful urban living spaces.",
    styles: ["Industrial", "Modern", "Contemporary"],
    cities: ["Delhi", "Noida", "Gurgaon"],
    priceMin: 400000,
    priceMax: 3000000,
    experience: 10,
    verified: true,
  },
  {
    name: "Fresh Start Interiors",
    firmName: null,
    phone: "9876543224",
    bio: "Young designer bringing fresh perspectives to home design.",
    styles: ["Minimalist", "Scandinavian"],
    cities: ["Gurgaon"],
    priceMin: 150000,
    priceMax: 800000,
    experience: 3,
    verified: false,
  },
  {
    name: "Elite Spaces",
    firmName: "Elite Design Co",
    phone: "9876543225",
    bio: "Premium interior solutions for discerning homeowners.",
    styles: ["Contemporary", "Modern"],
    cities: ["Delhi", "Gurgaon"],
    priceMin: 1000000,
    priceMax: 10000000,
    experience: 20,
    verified: false,
  },
]

// Contractor data
const contractorData = [
  {
    name: "Sharma Electricals",
    phone: "9876543230",
    trades: ["electrician"],
    bio: "Licensed electrical contractor with expertise in smart home installations.",
    areas: ["Delhi", "Gurgaon", "Noida"],
    experience: 15,
    verified: true,
  },
  {
    name: "Gupta Plumbing Services",
    phone: "9876543231",
    trades: ["plumber"],
    bio: "Expert plumbing solutions for residential and commercial projects.",
    areas: ["Delhi", "Gurgaon"],
    experience: 12,
    verified: true,
  },
  {
    name: "Master Carpenter Works",
    phone: "9876543232",
    trades: ["carpenter", "painter"],
    bio: "Custom furniture and woodwork specialists.",
    areas: ["Chandigarh", "Mohali", "Panchkula"],
    experience: 18,
    verified: true,
  },
  {
    name: "Build Right Contractors",
    phone: "9876543233",
    trades: ["mason", "general_contractor"],
    bio: "Complete civil work and construction services.",
    areas: ["Delhi", "Noida", "Gurgaon"],
    experience: 10,
    verified: false,
  },
]

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearData() {
  console.log("🗑️  Clearing existing Finishd data...")

  // Delete in reverse order of dependencies
  await db.delete(costEstimates)
  await db.delete(milestones)
  await db.delete(tasks)
  await db.delete(proposals)
  await db.delete(projectRequests)
  await db.delete(projects)
  await db.delete(properties)
  await db.delete(contractorProfiles)
  await db.delete(designerProfiles)
  await db.delete(homeownerProfiles)
  // Don't delete users as they might have other associations

  console.log("✅ Cleared existing data")
}

async function seedHomeowners() {
  console.log("👤 Seeding homeowners...")

  const createdHomeowners: Array<{ userId: string; profileId: string; city: string }> = []

  for (const data of homeownerData) {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        phone: data.phone,
        userType: "homeowner",
        languagePreference: "en",
      })
      .onConflictDoNothing()
      .returning()

    if (!user) {
      console.log(`  Skipping ${data.name} (already exists)`)
      continue
    }

    // Create profile
    const [profile] = await db
      .insert(homeownerProfiles)
      .values({
        userId: user.id,
        name: data.name,
        city: data.city,
        locality: data.locality,
      })
      .returning()

    // Create property
    await db.insert(properties).values({
      homeownerId: profile.id,
      type: Math.random() > 0.5 ? "apartment" : "house",
      city: data.city,
      locality: data.locality,
      sizeSqft: Math.floor(Math.random() * 2000) + 1000,
      rooms: {
        bedrooms: Math.floor(Math.random() * 3) + 2,
        bathrooms: Math.floor(Math.random() * 2) + 2,
        livingAreas: 1,
      },
    })

    createdHomeowners.push({ userId: user.id, profileId: profile.id, city: data.city })
    console.log(`  ✅ Created homeowner: ${data.name}`)
  }

  console.log(`✅ Created ${createdHomeowners.length} homeowners`)
  return createdHomeowners
}

async function seedDesigners() {
  console.log("🎨 Seeding designers...")

  const createdDesigners: Array<{ userId: string; profileId: string; verified: boolean }> = []

  for (const data of designerData) {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        phone: data.phone,
        userType: "designer",
        languagePreference: "en",
      })
      .onConflictDoNothing()
      .returning()

    if (!user) {
      console.log(`  Skipping ${data.name} (already exists)`)
      continue
    }

    // Create profile
    const [profile] = await db
      .insert(designerProfiles)
      .values({
        userId: user.id,
        name: data.name,
        firmName: data.firmName,
        bio: data.bio,
        styles: data.styles,
        serviceCities: data.cities,
        priceRangeMin: data.priceMin,
        priceRangeMax: data.priceMax,
        experienceYears: data.experience,
        projectsCompleted: Math.floor(Math.random() * 50) + 10,
        isVerified: data.verified,
        verifiedAt: data.verified ? new Date() : null,
      })
      .returning()

    createdDesigners.push({ userId: user.id, profileId: profile.id, verified: data.verified })
    console.log(`  ✅ Created designer: ${data.name} (${data.verified ? "verified" : "pending"})`)
  }

  console.log(`✅ Created ${createdDesigners.length} designers`)
  return createdDesigners
}

async function seedContractors() {
  console.log("🔧 Seeding contractors...")

  const createdContractors: Array<{ userId: string; profileId: string; verified: boolean }> = []

  for (const data of contractorData) {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        phone: data.phone,
        userType: "contractor",
        languagePreference: "en",
      })
      .onConflictDoNothing()
      .returning()

    if (!user) {
      console.log(`  Skipping ${data.name} (already exists)`)
      continue
    }

    // Create profile
    const [profile] = await db
      .insert(contractorProfiles)
      .values({
        userId: user.id,
        name: data.name,
        bio: data.bio,
        trades: data.trades,
        serviceAreas: data.areas,
        experienceYears: data.experience,
        isVerified: data.verified,
        verifiedAt: data.verified ? new Date() : null,
      })
      .returning()

    createdContractors.push({ userId: user.id, profileId: profile.id, verified: data.verified })
    console.log(`  ✅ Created contractor: ${data.name} (${data.verified ? "verified" : "pending"})`)
  }

  console.log(`✅ Created ${createdContractors.length} contractors`)
  return createdContractors
}

async function seedProjects(
  homeowners: Array<{ userId: string; profileId: string; city: string }>,
  designers: Array<{ userId: string; profileId: string; verified: boolean }>,
) {
  console.log("📋 Seeding projects...")

  const verifiedDesigners = designers.filter((d) => d.verified)

  // Create projects in different states
  const projectsToCreate = [
    // Draft projects (2)
    { homeownerIdx: 0, status: "draft" as const, title: "Living Room Makeover" },
    { homeownerIdx: 1, status: "draft" as const, title: "Kitchen Renovation" },
    // Seeking designer (2)
    { homeownerIdx: 2, status: "seeking_designer" as const, title: "Full Home Interior" },
    { homeownerIdx: 3, status: "seeking_designer" as const, title: "Master Bedroom Design" },
    // In progress (3)
    { homeownerIdx: 4, status: "in_progress" as const, title: "3BHK Complete Renovation", designerIdx: 0 },
    { homeownerIdx: 5, status: "in_progress" as const, title: "Modern Living Space", designerIdx: 1 },
    { homeownerIdx: 6, status: "in_progress" as const, title: "Traditional Home Design", designerIdx: 2 },
    // Completed (2)
    { homeownerIdx: 7, status: "completed" as const, title: "Apartment Interior", designerIdx: 3 },
    { homeownerIdx: 8, status: "completed" as const, title: "Villa Renovation", designerIdx: 0 },
    // Cancelled (1)
    { homeownerIdx: 9, status: "cancelled" as const, title: "Cancelled Project" },
  ]

  const createdProjects: Array<{ id: string; homeownerId: string; status: string }> = []

  for (const p of projectsToCreate) {
    const homeowner = homeowners[p.homeownerIdx]
    if (!homeowner) continue

    // Get property for this homeowner
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.homeownerId, homeowner.profileId))
      .limit(1)

    const [project] = await db
      .insert(projects)
      .values({
        homeownerId: homeowner.profileId,
        propertyId: property?.id,
        designerId: p.designerIdx !== undefined ? verifiedDesigners[p.designerIdx]?.profileId : null,
        title: p.title,
        scope: Math.random() > 0.3 ? "full_home" : "partial",
        status: p.status,
        budgetMin: 500000,
        budgetMax: 2000000,
        timelineWeeks: Math.floor(Math.random() * 12) + 8,
        startTimeline: "within_month",
      })
      .returning()

    createdProjects.push({ id: project.id, homeownerId: homeowner.profileId, status: p.status })
    console.log(`  ✅ Created project: ${p.title} (${p.status})`)

    // Add tasks and milestones for in-progress projects
    if (p.status === "in_progress") {
      await seedProjectDetails(project.id, homeowner.userId)
    }
  }

  console.log(`✅ Created ${createdProjects.length} projects`)
  return createdProjects
}

async function seedProjectDetails(projectId: string, userId: string) {
  // Create tasks
  const taskData = [
    { title: "Design concept approval", status: "completed" as const },
    { title: "Material selection", status: "completed" as const },
    { title: "Electrical work", status: "in_progress" as const },
    { title: "Plumbing work", status: "in_progress" as const },
    { title: "Carpentry work", status: "todo" as const },
    { title: "Painting", status: "todo" as const },
    { title: "Final inspection", status: "todo" as const },
  ]

  for (const t of taskData) {
    await db.insert(tasks).values({
      projectId,
      createdBy: userId,
      title: t.title,
      status: t.status,
      completedAt: t.status === "completed" ? new Date() : null,
    })
  }

  // Create milestones
  const milestoneData = [
    { title: "Design Approval", amount: 50000, status: "completed" as const, payment: "paid" as const },
    { title: "50% Work Completion", amount: 200000, status: "completed" as const, payment: "paid" as const },
    { title: "Final Delivery", amount: 150000, status: "pending" as const, payment: "not_paid" as const },
  ]

  let orderIndex = 0
  for (const m of milestoneData) {
    await db.insert(milestones).values({
      projectId,
      title: m.title,
      paymentAmount: m.amount,
      status: m.status,
      paymentStatus: m.payment,
      orderIndex: orderIndex++,
      completedAt: m.status === "completed" ? new Date() : null,
      paidAt: m.payment === "paid" ? new Date() : null,
    })
  }

  // Create cost estimates
  const costData = [
    { category: "design_fees" as const, description: "Interior design consultation", estimated: 50000, actual: 50000 },
    { category: "labor" as const, description: "Contractor labor charges", estimated: 150000, actual: 140000 },
    { category: "materials" as const, description: "Furniture and fixtures", estimated: 300000, actual: 280000 },
    { category: "materials" as const, description: "Flooring and tiles", estimated: 100000, actual: null },
    { category: "miscellaneous" as const, description: "Contingency fund", estimated: 50000, actual: null },
  ]

  for (const c of costData) {
    await db.insert(costEstimates).values({
      projectId,
      category: c.category,
      description: c.description,
      estimatedAmount: c.estimated,
      actualAmount: c.actual,
    })
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("\n🌱 Starting Finishd seed process...\n")

  try {
    await clearData()

    const homeowners = await seedHomeowners()
    const designers = await seedDesigners()
    const contractors = await seedContractors()
    await seedProjects(homeowners, designers)

    console.log("\n✨ Seed completed successfully!\n")
    console.log("Summary:")
    console.log(`  - ${homeowners.length} homeowners (with properties)`)
    console.log(`  - ${designers.length} designers (${designers.filter((d) => d.verified).length} verified)`)
    console.log(`  - ${contractors.length} contractors (${contractors.filter((c) => c.verified).length} verified)`)
    console.log(`  - 10 projects in various states`)
    console.log("\nTest accounts:")
    console.log("  - Homeowner: +91 9876543210 (use OTP: 123456)")
    console.log("  - Designer: +91 9876543220 (verified)")
    console.log("  - Contractor: +91 9876543230 (verified)")
  } catch (error) {
    console.error("\n❌ Seed failed:", error)
    process.exit(1)
  }

  process.exit(0)
}

main()
