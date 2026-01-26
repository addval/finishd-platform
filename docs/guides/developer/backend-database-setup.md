# Backend Database Setup - Rituality Platform

## 📋 Overview

This document provides a comprehensive guide for setting up, managing, and working with the PostgreSQL database in the Rituality Platform using Sequelize ORM.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🗄️ Database Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Database** | PostgreSQL | 14+ | Relational database |
| **ORM** | Sequelize | 6.x | Database abstraction layer |
| **Migrations** | Sequelize CLI | - | Schema version control |
| **Seeders** | Sequelize CLI | - | Default/test data |

---

## 📊 Database Overview

### Connection Details

**Environment Variables** (`.env`):
```bash
DB_NAME=rituality_platform
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
DB_LOGGING=false
```

### Naming Conventions

- **Database Columns**: `snake_case` (e.g., `email_verified_at`, `created_at`)
- **Model Attributes**: `camelCase` in TypeScript (e.g., `emailVerifiedAt`, `createdAt`)
- **Table Names**: Plural `snake_case` (e.g., `users`, `user_devices`)
- **Model Names**: Singular `PascalCase` (e.g., `User`, `UserDevice`)

### Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `roles` | User roles for RBAC | ✅ Implemented |
| `users` | User accounts and profiles | ✅ Implemented |
| `user_permissions` | User permissions and preferences | ✅ Implemented |
| `user_devices` | Device and session management | ✅ Implemented |

---

## 🚀 Initial Setup

### Prerequisites

1. **PostgreSQL Installation**:
   ```bash
   # macOS (Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql-14
   sudo systemctl start postgresql

   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE rituality_platform;

   # Create user (optional)
   CREATE USER rituality_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE rituality_platform TO rituality_user;

   # Exit
   \q
   ```

3. **Install Dependencies**:
   ```bash
   cd apps/backend
   npm install
   ```

---

## 📝 Migrations

### What Are Migrations?

Migrations are files that define changes to the database schema over time. They allow you to:
- Version control your database schema
- Roll back changes if needed
- Share database structure across team members
- Deploy schema changes consistently

### Migration Files

Current migrations:
```
apps/backend/src/migrations/
├── 20260109120001-create-roles.js
├── 20260109120002-create-users.js
├── 20260109120003-create-user-permissions.js
└── 20260109120004-create-user-devices.js
```

### Running Migrations

**Run all pending migrations**:
```bash
npm run migrate
```

**Run specific migration**:
```bash
npx sequelize-cli db:migrate --name 20260109120001-create-roles.js
```

**Undo last migration**:
```bash
npm run migrate:undo
```

**Undo all migrations**:
```bash
npm run migrate:undo:all
```

### Creating New Migrations

**Generate migration file**:
```bash
npx sequelize-cli migration:generate --name create-table-name
```

This creates a new file in `src/migrations/` with up and down functions:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create table or add columns
    await queryInterface.createTable('table_name', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // ... other columns
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback changes
    await queryInterface.dropTable('table_name');
  }
};
```

### Migration Best Practices

1. **Never modify existing migrations**: If you need to change a migration that's already been deployed, create a new one instead
2. **Always write down functions**: Every up should have a corresponding down
3. **Test migrations**: Always test migrations on a copy of production data
4. **Use transactions**: Wrap multiple operations in transactions
5. **Index foreign keys**: Always add indexes for foreign keys
6. **Don't use default values for existing columns**: This can lock tables in production

---

## 🌱 Seeders

### What Are Seeders?

Seeders are files that populate the database with initial or test data. They're useful for:
- Adding default data (roles, admin users)
- Creating test data for development
- Seeding reference data (countries, timezones)

### Running Seeders

**Run all seeders**:
```bash
npm run seed
```

**Run specific seeder**:
```bash
npx sequelize-cli db:seed:seed --name 20260109120001-create-default-roles.js
```

**Undo last seeder**:
```bash
npm run seed:undo
```

**Undo all seeders**:
```bash
npx sequelize-cli db:seed:undo:all
```

### Creating New Seeders

**Generate seeder file**:
```bash
npx sequelize-cli seed:generate --name seeder-name
```

**Example seeder**:
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        role_id: '550e8400-e29b-41d4-a716-446655440002', // admin
        email: 'admin@rituality.com',
        password_hash: await bcrypt.hash('AdminPass123', 10),
        name: 'Admin User',
        email_verified: true,
        onboarding_completed: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
```

### Current Seeders

**20260109120001-create-default-roles.js**:
- Creates default roles: `admin` and `user`
- Run this after creating the roles table

---

## 🔧 Database Configuration

### Configuration File

Located at: `apps/backend/src/config/database.ts`

```typescript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'rituality_platform',
  process.env.DB_USERNAME || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    underscored: true,  // Use snake_case for columns
    paranoid: true,     // Enable soft deletes (deleted_at)
    timezone: '+00:00'  // UTC
  }
);
```

### Connection Pool

**Settings**:
- **max**: 10 connections (maximum pool size)
- **min**: 0 connections (minimum pool size)
- **acquire**: 30000ms (maximum time to get connection)
- **idle**: 10000ms (maximum time connection can be idle)

---

## 📚 Models

### What Are Models?

Models represent database tables and provide an interface to interact with data. They include:
- Table schema definition
- Relationships (associations)
- Scopes (pre-defined queries)
- Instance and class methods
- Validations

### Model Files

Located at: `apps/backend/src/models/`

```
models/
├── index.ts              # Model exports and associations
├── Role.model.ts         # Role model
├── User.model.ts         # User model
├── UserPermission.model.ts  # User permissions model
└── UserDevice.model.ts   # User device model
```

### Using Models

**Find user by email**:
```typescript
const user = await User.findOne({
  where: { email: 'user@example.com' }
});
```

**Create new user**:
```typescript
const user = await User.create({
  email: 'user@example.com',
  password_hash: hashedPassword,
  name: 'John Doe',
  role_id: userRoleId
});
```

**Update user**:
```typescript
await User.update(
  { name: 'Jane Doe' },
  { where: { id: userId } }
);
```

**Delete user (soft delete)**:
```typescript
await User.destroy({
  where: { id: userId }
});
// Sets deleted_at timestamp instead of deleting
```

### Model Relationships

**User → Role** (Belongs To):
```typescript
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
```

**User → UserPermissions** (Has One):
```typescript
User.hasOne(UserPermission, { foreignKey: 'user_id', as: 'permissions' });
UserPermission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
```

**User → UserDevices** (Has Many):
```typescript
User.hasMany(UserDevice, { foreignKey: 'user_id', as: 'devices' });
UserDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
```

### Model Scopes

Scopes are pre-defined queries that can be reused.

**Example in User.model.ts**:
```typescript
User.addScope('active', {
  where: {
    status: 'active',
    deleted: false
  }
});

User.addScope('verified', {
  where: {
    email_verified: true
  }
});

// Usage
const activeUsers = await User.scope('active').findAll();
const verifiedUsers = await User.scope('verified').findAll();
const activeAndVerified = await User.scope(['active', 'verified']).findAll();
```

---

## 🛠️ Common Operations

### Database Backup

**Backup using pg_dump**:
```bash
pg_dump -U postgres -d rituality_platform > backup_$(date +%Y%m%d).sql
```

**Restore from backup**:
```bash
psql -U postgres -d rituality_platform < backup_20260112.sql
```

### Reset Database

**⚠️ WARNING**: This deletes all data!

```bash
# Drop all tables
npm run db:drop

# Recreate tables and run migrations
npm run db:create

# Run migrations
npm run migrate

# Run seeders
npm run seed
```

### View Table Structure

**Using psql**:
```bash
psql -U postgres -d rituality_platform

# Describe table
\d users

# List all tables
\dt

# Exit
\q
```

---

## 🔍 Querying Tips

### Using Associations (Eager Loading)

**Include related data**:
```typescript
const user = await User.findOne({
  where: { id: userId },
  include: [
    {
      model: Role,
      as: 'role',
      attributes: ['id', 'name', 'description']
    },
    {
      model: UserPermission,
      as: 'permissions'
    },
    {
      model: UserDevice,
      as: 'devices',
      where: { is_active: true }  // Filter related data
    }
  ]
});
```

### Pagination

**Paginated query**:
```typescript
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const { count, rows } = await User.findAndCountAll({
  limit,
  offset,
  order: [['created_at', 'DESC']]
});

console.log(`Total users: ${count}`);
console.log(`Page ${page} users:`, rows);
```

### Transactions

**Wrap multiple operations**:
```typescript
await sequelize.transaction(async (t) => {
  const user = await User.create({
    email: 'user@example.com',
    password_hash: hashedPassword
  }, { transaction: t });

  await UserPermission.create({
    user_id: user.id,
    notifications_enabled: false
  }, { transaction: t });
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Connection refused**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Check if PostgreSQL is running:
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Start PostgreSQL
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

**2. Database doesn't exist**:
```
Error: database "rituality_platform" does not exist
```
**Solution**: Create the database:
```bash
psql -U postgres -c "CREATE DATABASE rituality_platform;"
```

**3. Migration already executed**:
```
Error: Migration .... was already executed
```
**Solution**: Check migration status in `SequelizeMeta` table:
```bash
psql -U postgres -d rituality_platform -c "SELECT * FROM \"SequelizeMeta\";"
```

**4. Foreign key constraint error**:
```
Error: insert or update on table violates foreign key constraint
```
**Solution**: Ensure referenced record exists before creating related record

**5. Table already exists**:
```
Error: relation "users" already exists
```
**Solution**: Check if migrations were already run, or drop table if needed:
```bash
psql -U postgres -d rituality_platform -c "DROP TABLE IF EXISTS users CASCADE;"
```

---

## 📚 Related Documentation

- [Database Schema](../../../DATABASE_SCHEMA.md) - Complete schema documentation
- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [Auth Flow](./backend-auth-flow.md) - Authentication implementation
- [Local Development Setup](./local-development-setup.md) - Complete setup guide

---

## 📖 Sequelize Resources

- [Sequelize Documentation](https://sequelize.org/)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
