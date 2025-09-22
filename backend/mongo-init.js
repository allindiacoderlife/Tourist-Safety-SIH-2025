// MongoDB initialization script
db = db.getSiblingDB('tourist_safety');

// Create application user
db.createUser({
  user: 'tourist_app',
  pwd: 'tourist_app_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'tourist_safety'
    }
  ]
});

// Create collections with indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

print('Tourist Safety Database initialized successfully!');