/**
 * Seeder Script
 * Runs database seeders using Sequelize CLI
 */

import { execSync } from "node:child_process"

const runCommand = (command: string, description: string) => {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, {
      stdio: "inherit",
      cwd: "/Users/sanyamkapoor/Desktop/rituality-platform/apps/backend",
    })
    console.log(`${description} completed`)
  } catch (_error) {
    console.error(`${description} failed`)
    process.exit(1)
  }
}

const main = async () => {
  console.log("Starting database seeding...\n")

  // Run seeders from backend root
  runCommand("npx sequelize-cli db:seed:all --options-path .sequelizerc", "Running seeders")

  console.log("\n✨ All seeders completed successfully!")
}

main().catch(error => {
  console.error("Error:", error)
  process.exit(1)
})
