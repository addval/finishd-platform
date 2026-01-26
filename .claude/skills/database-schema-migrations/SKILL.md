---
name: database-schema-migrations
description: Design PostgreSQL database schemas, generate Sequelize migrations, create models with associations, and implement database best practices. Use when creating tables, modifying schema, setting up relationships, or working with database operations.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Database Schema & Migrations

Comprehensive guide for PostgreSQL database design with Sequelize ORM, migrations, and best practices.

## Core Principles

### Separation of Concerns
- **Models** represent database tables in application code
- **Migrations** track schema changes over time
- **Seeders** populate database with initial/sample data

### Naming Conventions

| Level | Convention | Example |
|-------|-----------|---------|
| Database Table | snake_case, plural | `user_profiles`, `order_items` |
| Model Class | PascalCase, singular | `UserProfile`, `OrderItem` |
| JavaScript Properties | camelCase | `firstName`, `orderId` |
| Database Columns | snake_case | `first_name`, `order_id` |

## Quick Start

### Creating a New Table

1. Generate migration: `npx sequelize migration:generate --name create-users`
2. Define table structure in migration file
3. Create corresponding model file
4. Run migration: `npx sequelize db:migrate`

### Modifying Existing Table

1. Generate new migration
2. Use `change` method for reversible changes
3. Test migration and rollback
4. Run migration: `npx sequelize db:migrate`

## File Structure

```
backend/src/
├── migrations/
│   ├── 20240101000000-create-users.js
│   ├── 20240102000000-create-posts.js
│   └── 20240103000000-add-user-status.js
├── models/
│   ├── index.js                  # Models aggregator and associations
│   ├── user.model.js
│   ├── post.model.js
│   └── comment.model.js
└── seeders/
    ├── 20240101000000-demo-users.js
    └── 20240102000000-demo-posts.js
```

## Migration Best Practices

### Basic Migration Template

```javascript
// migrations/20240101000000-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'super_admin'),
        defaultValue: 'user',
        allowNull: false
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    await queryInterface.addIndex('users', ['status'], {
      name: 'users_status_idx'
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'users_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

### Adding Columns

```javascript
// migrations/20240103000000-add-user-avatar.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'avatar_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: 'https://example.com/default-avatar.png'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'avatar_url');
  }
};
```

### Creating Foreign Keys

```javascript
// migrations/20240102000000-create-posts.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Indexes
    await queryInterface.addIndex('posts', ['author_id'], {
      name: 'posts_author_id_idx'
    });

    await queryInterface.addIndex('posts', ['slug'], {
      unique: true,
      name: 'posts_slug_unique'
    });

    await queryInterface.addIndex('posts', ['status', 'published_at'], {
      name: 'posts_status_published_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('posts');
  }
};
```

### Creating Junction Tables (Many-to-Many)

```javascript
// migrations/20240104000000-create-post-tags.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_tags', {
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Composite index
    await queryInterface.addIndex('post_tags', ['post_id', 'tag_id'], {
      unique: true,
      name: 'post_tags_post_tag_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('post_tags');
  }
};
```

### Modifying Columns

```javascript
// migrations/20240105000000-modify-users-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change column type
    await queryInterface.changeColumn('users', 'first_name', {
      type: Sequelize.STRING(150),
      allowNull: false
    });

    // Add default value
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending'),
      defaultValue: 'pending',
      allowNull: false
    });

    // Make column nullable
    await queryInterface.changeColumn('users', 'last_login_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'first_name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      allowNull: false
    });
  }
};
```

## Sequelize Models

### Basic Model Definition

```javascript
// models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      defaultValue: 'pending',
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin'),
      defaultValue: 'user',
      allowNull: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true, // Enable soft deletes
    underscored: true, // Use snake_case for column names
    indexes: [
      {
        unique: true,
        fields: ['email'],
        name: 'users_email_unique'
      },
      {
        fields: ['status'],
        name: 'users_status_idx'
      }
    ],
    scopes: {
      active: {
        where: { status: 'active' }
      },
      admins: {
        where: { role: ['admin', 'super_admin'] }
      },
      withoutPassword: {
        attributes: { exclude: ['passwordHash'] }
      }
    },
    hooks: {
      beforeCreate: async (user) => {
        // Hash password before creating
        if (user.passwordHash) {
          const bcrypt = require('bcrypt');
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
      beforeUpdate: async (user) => {
        // Hash password if it's being changed
        if (user.changed('passwordHash')) {
          const bcrypt = require('bcrypt');
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
  };

  User.prototype.comparePassword = async function(password) {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  return User;
};
```

### Model Associations

```javascript
// models/index.js
const User = require('./user.model');
const Post = require('./post.model');
const Comment = require('./comment.model');
const Tag = require('./tag.model');

// Define associations
User.hasMany(Post, {
  foreignKey: 'author_id',
  as: 'posts',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Post.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author'
});

Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

Comment.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author'
});

// Many-to-Many
Post.belongsToMany(Tag, {
  through: 'post_tags',
  foreignKey: 'post_id',
  otherKey: 'tag_id',
  as: 'tags'
});

Tag.belongsToMany(Post, {
  through: 'post_tags',
  foreignKey: 'tag_id',
  otherKey: 'post_id',
  as: 'posts'
});

module.exports = { User, Post, Comment, Tag };
```

## Database Design Best Practices

### 1. Always Use Migrations

❌ **BAD**: Never modify database schema directly
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

✅ **GOOD**: Always create migrations
```javascript
// Create migration file first
await queryInterface.addColumn('users', 'phone', {
  type: Sequelize.STRING(20),
  allowNull: true
});
```

### 2. Use Appropriate Data Types

| Use Case | Data Type | Example |
|----------|-----------|---------|
| Short text | STRING(255) | Email, username |
| Long text | TEXT | Post content, description |
| Integer numbers | INTEGER | ID, count, foreign keys |
| Decimal numbers | DECIMAL(10,2) | Price, amount |
| Boolean | BOOLEAN | Is active, is published |
| Date/time | DATE | Created at, updated at |
| Enumerated values | ENUM | Status, role |
| JSON data | JSONB | Metadata, settings |

### 3. Index Optimization

Add indexes for:
- Columns frequently used in WHERE clauses
- Columns used in JOIN conditions
- Columns used in ORDER BY
- Columns used for searching

```javascript
// Single column index
await queryInterface.addIndex('users', ['email'], {
  unique: true
});

// Composite index
await queryInterface.addIndex('posts', ['status', 'published_at'], {
  name: 'posts_status_published_at_idx'
});

// Partial index (PostgreSQL specific)
await queryInterface.addIndex('orders', ['user_id', 'created_at'], {
  where: { status: 'completed' },
  name: 'orders_completed_idx'
});
```

### 4. Foreign Key Constraints

```javascript
author_id: {
  type: Sequelize.INTEGER,
  allowNull: false,
  references: {
    model: 'users',
    key: 'id'
  },
  onUpdate: 'CASCADE',    // Update FK when referenced ID changes
  onDelete: 'RESTRICT'    // Prevent deletion if referenced
}
```

**Delete strategies:**
- `CASCADE`: Delete related records
- `RESTRICT`: Prevent deletion (default)
- `SET NULL`: Set FK to NULL
- `NO ACTION`: Similar to RESTRICT

### 5. Use Timestamps

```javascript
created_at: {
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
},
updated_at: {
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
}
```

### 6. Soft Deletes

Instead of permanently deleting records, mark them as deleted:

```javascript
deleted_at: {
  type: Sequelize.DATE,
  allowNull: true
}

// In model
User.destroy({ where: { id: 1 } });
// Actually sets deleted_at timestamp instead of deleting row

// Find only non-deleted records
User.findAll(); // Automatically excludes deleted records

// Find all records including deleted
User.findAll({ paranoid: false });
```

### 7. Validation at Model Level

```javascript
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true,
    notEmpty: true
  }
}

price: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false,
  validate: {
    min: 0,
    isDecimal: true
  }
}

username: {
  type: DataTypes.STRING(50),
  allowNull: false,
  validate: {
    len: [3, 50],
    isAlphanumeric: true
  }
}
```

## Common Patterns

### Audit Trail Pattern

```javascript
// migrations/20240106000000-create-audit-logs.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('INSERT', 'UPDATE', 'DELETE'),
        allowNull: false
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      changed_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('audit_logs', ['table_name', 'record_id'], {
      name: 'audit_logs_table_record_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  }
};
```

## Migration Commands

```bash
# Create a new migration
npx sequelize migration:generate --name migration-name

# Run all pending migrations
npx sequelize db:migrate

# Undo last migration
npx sequelize db:migrate:undo

# Undo all migrations
npx sequelize db:migrate:undo:all

# Run seeders
npx sequelize db:seed:all

# Create a new seeder
npx sequelize seed:generate --name seeder-name
```

## Additional Resources

- [MODELS.md](MODELS.md) - Model definitions and patterns
- [ASSOCIATIONS.md](ASSOCIATIONS.md) - Relationship types and examples

## Utility Scripts

Generate model and migration:
```bash
node .claude/skills/database-schema-migrations/scripts/generate-model.js [ModelName]
```
