# Sequelize Associations - Complete Guide

## Association Types

Sequelize supports four types of associations:

1. **Has One** - One-to-one relationship
2. **Belongs To** - Many-to-one relationship
3. **Has Many** - One-to-many relationship
4. **Belongs To Many** - Many-to-many relationship

## 1. Belongs To (Many-to-One)

### Example: User has many Posts, Post belongs to User

```javascript
// models/user.model.js
const User = sequelize.define('User', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING
});

// models/post.model.js
const Post = sequelize.define('Post', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  title: Sequelize.STRING,
  content: Sequelize.TEXT,
  authorId: { // Foreign key
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

// Define association
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});
```

### Usage

```javascript
// Create post with user association
const post = await Post.create({
  title: 'My First Post',
  content: 'Hello World',
  authorId: 1 // Direct foreign key assignment
});

// Or using build
const user = await User.findByPk(1);
const post = await Post.create({
  title: 'Another Post',
  content: 'Content here'
});
await user.addPost(post);

// Fetch post with author
const postWithAuthor = await Post.findByPk(1, {
  include: [{
    model: User,
    as: 'author',
    attributes: ['id', 'firstName', 'lastName']
  ]
});

console.log(postWithAuthor.author.firstName); // Access associated user

// Fetch user with posts
const userWithPosts = await User.findByPk(1, {
  include: [{
    model: Post,
    as: 'posts',
    where: { status: 'published' } // Filter related records
  }]
});

console.log(userWithPosts.posts); // Array of posts
```

## 2. Has One (One-to-One)

### Example: User has one Profile

```javascript
// models/user.model.js
const User = sequelize.define('User', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  email: Sequelize.STRING
});

// models/profile.model.js
const Profile = sequelize.define('Profile', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  bio: Sequelize.TEXT,
  avatar: Sequelize.STRING,
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

// Define association
User.hasOne(Profile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE'
});

Profile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
```

### Usage

```javascript
// Create user with profile
const user = await User.create({
  email: 'user@example.com'
});

await Profile.create({
  bio: 'Software developer',
  avatar: 'avatar.jpg',
  userId: user.id
});

// Or using set
const profile = await Profile.create({
  bio: 'Software developer'
});
await user.setProfile(profile);

// Fetch user with profile
const userWithProfile = await User.findByPk(1, {
  include: [{
    model: Profile,
    as: 'profile'
  }]
});

console.log(userWithProfile.profile.bio);
```

## 3. Has Many (One-to-Many)

### Example: User has many Addresses

```javascript
// models/user.model.js
const User = sequelize.define('User', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  email: Sequelize.STRING
});

// models/address.model.js
const Address = sequelize.define('Address', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  street: Sequelize.STRING,
  city: Sequelize.STRING,
  country: Sequelize.STRING,
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

// Define association
User.hasMany(Address, {
  foreignKey: 'userId',
  as: 'addresses',
  onDelete: 'CASCADE'
});

Address.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
```

### Usage

```javascript
// Create multiple addresses
const user = await User.findByPk(1);

await Address.bulkCreate([
  {
    street: '123 Main St',
    city: 'New York',
    country: 'USA',
    userId: user.id
  },
  {
    street: '456 Oak Ave',
    city: 'Los Angeles',
    country: 'USA',
    userId: user.id
  }
]);

// Or using add
await user.addAddresses([
  address1,
  address2
]);

// Fetch with addresses
const userWithAddresses = await User.findByPk(1, {
  include: [{
    model: Address,
    as: 'addresses'
  }]
});

// Count associations
const addressCount = await user.countAddresses();

// Check if has association
const hasAddresses = await user.hasAddresses();

// Remove association
await user.removeAddress(address1);

// Remove all associations
await user.setAddresses([]);
```

## 4. Belongs To Many (Many-to-Many)

### Example: Post belongs to many Tags, Tag belongs to many Posts

```javascript
// models/post.model.js
const Post = sequelize.define('Post', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  title: Sequelize.STRING,
  content: Sequelize.TEXT
});

// models/tag.model.js
const Tag = sequelize.define('Tag', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  name: { type: Sequelize.STRING, unique: true }
});

// Junction table (through table)
const PostTag = sequelize.define('PostTag', {
  postId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  tagId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: {
      model: 'tags',
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

// Define associations
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: 'postId',
  otherKey: 'tagId',
  as: 'tags',
  onDelete: 'CASCADE'
});

Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: 'tagId',
  otherKey: 'postId',
  as: 'posts',
  onDelete: 'CASCADE'
});
```

### Usage

```javascript
// Create post with tags
const post = await Post.create({
  title: 'JavaScript Tips',
  content: 'Great JS tips'
});

const tags = await Tag.bulkCreate([
  { name: 'javascript' },
  { name: 'programming' },
  { name: 'web-dev' }
]);

// Add tags to post
await post.addTags(tags);

// Or create with tags
const postWithTags = await Post.create({
  title: 'React Guide',
  content: 'React tutorial'
}, {
  include: [{
    model: Tag,
    as: 'tags'
  }]
});

// Fetch post with tags
const postWithTags = await Post.findByPk(1, {
  include: [{
    model: Tag,
    as: 'tags',
    through: { attributes: [] } // Exclude junction table data
  }]
});

console.log(postWithTags.tags); // Array of tags

// Add single tag
await post.addTag(tag1);

// Remove tag
await post.removeTag(tag1);

// Set tags (replace all)
await post.setTags([tag1, tag2]);

// Check if has tag
const hasTag = await post.hasTag(tag1);

// Count tags
const tagCount = await post.countTags();
```

## Advanced Association Patterns

### Self-Referential Associations

```javascript
// User follows users (many-to-many self-reference)
const User = sequelize.define('User', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  username: Sequelize.STRING
});

const UserFollower = sequelize.define('UserFollower', {
  followerId: {
    type: Sequelize.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  followeeId: {
    type: Sequelize.INTEGER,
    references: { model: 'users', key: 'id' }
  }
});

User.belongsToMany(User, {
  through: UserFollower,
  as: 'followers',
  foreignKey: 'followeeId',
  otherKey: 'followerId'
});

User.belongsToMany(User, {
  through: UserFollower,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followeeId'
});

// Usage
const user = await User.findByPk(1);
const followers = await user.getFollowers();
const following = await user.getFollowing();
```

### Polymorphic Associations

```javascript
// Comment can belong to Post or Video
const Comment = sequelize.define('Comment', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  content: Sequelize.TEXT,
  commentableId: Sequelize.INTEGER, // ID of commented item
  commentableType: Sequelize.STRING // Type: 'post' or 'video'
});

const Post = sequelize.define('Post', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  title: Sequelize.STRING
});

const Video = sequelize.define('Video', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  title: Sequelize.STRING,
  url: Sequelize.STRING
});

// Define associations manually
Post.hasMany(Comment, {
  foreignKey: 'commentableId',
  constraints: false,
  scope: {
    commentableType: 'post'
  },
  as: 'comments'
});

Comment.belongsTo(Post, {
  foreignKey: 'commentableId',
  constraints: false,
  as: 'post'
});

Video.hasMany(Comment, {
  foreignKey: 'commentableId',
  constraints: false,
  scope: {
    commentableType: 'video'
  },
  as: 'comments'
});

Comment.belongsTo(Video, {
  foreignKey: 'commentableId',
  constraints: false,
  as: 'video'
});

// Helper method to get comments
Comment.prototype.getCommentable = async function() {
  if (this.commentableType === 'post') {
    return await this.getPost();
  } else if (this.commentableType === 'video') {
    return await this.getVideo();
  }
};
```

### Nested Associations

```javascript
// Fetch post with author, comments, and comment authors
const post = await Post.findByPk(1, {
  include: [{
    model: User,
    as: 'author',
    attributes: ['id', 'firstName', 'lastName']
  }, {
    model: Comment,
    as: 'comments',
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'firstName', 'lastName']
    }],
    where: { status: 'approved' },
    required: false
  }]
});
```

### Association Scopes

```javascript
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
  scope: {
    status: 'published' // Only fetch published posts by default
  }
});

// Override scope
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    as: 'posts',
    where: { status: 'draft' } // Override default scope
  }]
});
```

### Association Hooks

```javascript
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
  hooks: {
    beforeAdd: (comment, options) => {
      console.log('Adding comment to post');
    },
    afterAdd: (comment, options) => {
      // Update post comment count
      Post.increment('commentCount', {
        where: { id: comment.postId }
      });
    }
  }
});
```

## Best Practices

1. **Always define both sides** of the association
2. **Use descriptive aliases** with `as` option
3. **Set proper foreign key constraints** (onDelete, onUpdate)
4. **Use through tables** for many-to-many with extra fields
5. **Leverage scopes** to filter associated records
6. **Use eager loading** (include) to avoid N+1 queries
7. **Add indexes** on foreign keys for performance
8. **Use paranoid: true** for soft deletes with associations
9. **Consider caching** frequently accessed associations
10. **Test associations** thoroughly, especially cascading deletes
