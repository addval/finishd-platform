# Sequelize Models - Advanced Patterns

## Model Hooks

### Lifecycle Hooks

```javascript
const User = sequelize.define('User', {
  // ... fields
}, {
  hooks: {
    // Before operations
    beforeValidate: (user) => {
      // Transform data before validation
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    },

    afterValidate: (user) => {
      // Post-validation logic
    },

    beforeCreate: async (user) => {
      // Hash password before creating
      if (user.passwordHash) {
        const bcrypt = require('bcrypt');
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    },

    afterCreate: async (user) => {
      // Send welcome email
      const EmailService = require('../services/email.service');
      await EmailService.sendWelcome(user);
    },

    beforeUpdate: async (user) => {
      // Check if email is being changed
      if (user.changed('email')) {
        // Send verification email
      }
    },

    afterUpdate: (user) => {
      // Update cache
      const cache = require('../utils/cache');
      cache.del(`user:${user.id}`);
    },

    beforeDestroy: async (user) => {
      // Check if user can be deleted
      if (user.role === 'super_admin') {
        throw new Error('Cannot delete super admin');
      }
    },

    afterDestroy: (user) => {
      // Log deletion
      console.log(`User ${user.id} deleted`);
    }
  }
});
```

## Scopes

### Defining Scopes

```javascript
const Post = sequelize.define('Post', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT,
  status: Sequelize.ENUM('draft', 'published', 'archived'),
  publishedAt: Sequelize.DATE,
  authorId: Sequelize.INTEGER
}, {
  scopes: {
    // Simple scope
    published: {
      where: { status: 'published' }
    },

    // Complex scope with conditions
    recent: {
      where: {
        publishedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    },

    // Scope with include
    withAuthor: {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName']
      }]
    },

    // Scope with attributes
    summary: {
      attributes: ['id', 'title', 'status', 'publishedAt']
    },

    // Computed scope
    popular: {
      where: {
        views: {
          [Op.gte]: 1000
        }
      }
    },

    // Combined scope
    publishedWithAuthor: {
      where: { status: 'published' },
      include: [{
        model: User,
        as: 'author'
      }]
    }
  }
});

// Using scopes
Post.published.findAll(); // Only published posts
Post.scope('published', 'recent').findAll(); // Both scopes
Post.scope('withAuthor').findAll(); // With author data

// Scope chaining
Post.scope('published', 'summary').findAll();

// Remove scope
Post.unscoped().findAll(); // All records
```

### Dynamic Scopes

```javascript
const Product = sequelize.define('Product', {
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(10, 2),
  category: Sequelize.STRING
}, {
  scopes: {
    // Dynamic scope with parameters
    byPriceRange: (minPrice, maxPrice) => ({
      where: {
        price: {
          [Op.between]: [minPrice, maxPrice]
        }
      }
    }),

    byCategory: (category) => ({
      where: { category }
    }),

    search: (query) => ({
      where: {
        name: {
          [Op.iLike]: `%${query}%`
        }
      }
    })
  }
});

// Using dynamic scopes
Product.scope({ method: ['byPriceRange', 10, 100] }).findAll();
Product.scope({ method: ['byCategory', 'electronics'] }).findAll();
```

## Instance Methods

```javascript
const User = sequelize.define('User', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  passwordHash: Sequelize.STRING,
  dateOfBirth: Sequelize.DATE
}, {
  instanceMethods: {
    // Get full name
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    },

    // Calculate age
    getAge() {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    },

    // Check if user is adult
    isAdult() {
      return this.getAge() >= 18;
    },

    // Compare password
    async comparePassword(password) {
      const bcrypt = require('bcrypt');
      return bcrypt.compare(password, this.passwordHash);
    },

    // Generate JWT token
    generateToken() {
      const jwt = require('jsonwebtoken');
      return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    },

    // To JSON with excluded fields
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.passwordHash;
      return values;
    }
  }
});

// Usage
const user = await User.findByPk(1);
console.log(user.getFullName()); // John Doe
console.log(user.getAge()); // 25
```

## Static Methods (Class Methods)

```javascript
const User = sequelize.define('User', {
  // ... fields
}, {
  classMethods: {
    // Find by email
    async findByEmail(email) {
      return await User.findOne({
        where: { email: email.toLowerCase() }
      });
    },

    // Find active users
    async findActive() {
      return await User.findAll({
        where: { status: 'active' }
      });
    },

    // Search users
    async search(query) {
      const { Op } = require('sequelize');
      return await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } }
          ]
        }
      });
    },

    // Register new user
    async register(data) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return await User.create({
        ...data,
        passwordHash: hashedPassword
      });
    },

    // Get statistics
    async getStatistics() {
      const total = await User.count();
      const active = await User.count({ where: { status: 'active' } });
      const inactive = await User.count({ where: { status: 'inactive' } });

      return { total, active, inactive };
    }
  }
});

// Usage
const user = await User.findByEmail('user@example.com');
const users = await User.search('john');
const stats = await User.getStatistics();
```

## Virtual Fields

```javascript
const Order = sequelize.define('Order', {
  subtotal: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  shipping: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  // Virtual getters
  getterMethods: {
    total() {
      return parseFloat(this.subtotal) + parseFloat(this.tax) + parseFloat(this.shipping);
    },

    formattedTotal() {
      return `$${this.total.toFixed(2)}`;
    },

    fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  },

  // Virtual setters
  setterMethods: {
    fullName(value) {
      const names = value.split(' ');
      this.setDataValue('firstName', names[0]);
      this.setDataValue('lastName', names.slice(1).join(' '));
    }
  }
});

// Usage
const order = await Order.create({
  subtotal: 100,
  tax: 8,
  shipping: 10
});

console.log(order.total); // 118
```

## Complex Queries

### Eager Loading

```javascript
// Single level
const posts = await Post.findAll({
  include: [{
    model: User,
    as: 'author',
    attributes: ['id', 'firstName', 'lastName']
  }]
});

// Nested includes
const posts = await Post.findAll({
  include: [{
    model: Comment,
    as: 'comments',
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'firstName', 'lastName']
    }]
  }]
});

// Multiple includes
const posts = await Post.findAll({
  include: [
    {
      model: User,
      as: 'author'
    },
    {
      model: Tag,
      as: 'tags',
      through: { attributes: [] }
    },
    {
      model: Comment,
      as: 'comments',
      where: { status: 'approved' },
      required: false // LEFT JOIN instead of INNER JOIN
    }
  ]
});
```

### Filtering and Ordering

```javascript
const posts = await Post.findAll({
  where: {
    status: 'published',
    publishedAt: {
      [Op.gte]: new Date('2024-01-01')
    }
  },
  order: [
    ['publishedAt', 'DESC'],
    ['createdAt', 'ASC']
  ],
  limit: 10,
  offset: 0
});
```

### Aggregation

```javascript
// Count
const count = await User.count({
  where: { status: 'active' }
});

// Sum
const total = await Order.sum('total', {
  where: { status: 'completed' }
});

// Average
const avgOrderValue = await Order.findAll({
  attributes: [
    [sequelize.fn('AVG', sequelize.col('total')), 'averageOrderValue']
  ]
});

// Group by
const userOrderCounts = await Order.findAll({
  attributes: [
    'userId',
    [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
  ],
  group: ['userId'],
  having: sequelize.where(sequelize.fn('COUNT', sequelize.col('id')), '>', 5)
});
```

### Pagination

```javascript
const getPaginatedPosts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Post.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};
```

## Transactions

```javascript
const createOrderWithItems = async (userId, items) => {
  const t = await sequelize.transaction();

  try {
    // Create order
    const order = await Order.create({
      userId,
      status: 'pending'
    }, { transaction: t });

    // Create order items
    const orderItems = await OrderItem.bulkCreate(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      { transaction: t }
    );

    // Update inventory
    for (const item of items) {
      await Product.decrement(
        'stock',
        {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t
        }
      );
    }

    await t.commit();
    return { order, orderItems };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
```

## Raw Queries

```javascript
// Simple query
const users = await sequelize.query(
  'SELECT * FROM users WHERE status = :status',
  {
    replacements: { status: 'active' },
    type: sequelize.QueryTypes.SELECT
  }
);

// Complex query
const results = await sequelize.query(`
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.status = :status
  GROUP BY u.id
  HAVING COUNT(o.id) > :minOrders
  ORDER BY total_spent DESC
`,
  {
    replacements: { status: 'active', minOrders: 5 },
    type: sequelize.QueryTypes.SELECT
  }
);
```
