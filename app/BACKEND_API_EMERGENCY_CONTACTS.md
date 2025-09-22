# Emergency Contacts Backend API Specification

## Database Schema

### EmergencyContact Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User who owns this contact
  name: String, // Required - Full name of emergency contact
  phone: String, // Required - Phone number with country code
  email: String, // Optional - Email address
  relationship: String, // Required - Relationship type (enum)
  isPrimary: Boolean, // Default false - Only one can be true per user
  isActive: Boolean, // Default true - Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

### Relationship Types (Enum)
```javascript
const RELATIONSHIP_TYPES = [
  'Family Member', 'Spouse', 'Parent', 'Sibling', 'Child',
  'Friend', 'Colleague', 'Doctor', 'Lawyer', 'Other'
]
```

## API Endpoints

### 1. GET /api/emergency-contacts
**Description:** Get all emergency contacts for authenticated user
**Authentication:** Bearer Token Required
**Method:** GET

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "64f7b8c9e4b0123456789abc",
      "userId": "64f7b8c9e4b0123456789def",
      "name": "John Doe",
      "phone": "+91 98765 43210",
      "email": "john@example.com",
      "relationship": "Family Member",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2024-09-22T10:30:00.000Z",
      "updatedAt": "2024-09-22T10:30:00.000Z"
    }
  ],
  "message": "Emergency contacts retrieved successfully"
}
```

**Error Response:**
```javascript
{
  "success": false,
  "message": "No emergency contacts found",
  "data": []
}
```

---

### 2. POST /api/emergency-contacts
**Description:** Add new emergency contact
**Authentication:** Bearer Token Required
**Method:** POST

**Request Body:**
```javascript
{
  "name": "Jane Smith",
  "phone": "+91 87654 32109", 
  "email": "jane@example.com", // Optional
  "relationship": "Friend",
  "isPrimary": false
}
```

**Validation Rules:**
- `name`: Required, string, min 2 characters, max 100 characters
- `phone`: Required, string, valid phone format with country code
- `email`: Optional, valid email format
- `relationship`: Required, must be one of RELATIONSHIP_TYPES
- `isPrimary`: Boolean, if true, set other contacts' isPrimary to false

**Response:**
```javascript
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e4b0123456789xyz",
    "userId": "64f7b8c9e4b0123456789def",
    "name": "Jane Smith",
    "phone": "+91 87654 32109",
    "email": "jane@example.com",
    "relationship": "Friend",
    "isPrimary": false,
    "isActive": true,
    "createdAt": "2024-09-22T11:30:00.000Z",
    "updatedAt": "2024-09-22T11:30:00.000Z"
  },
  "message": "Emergency contact added successfully"
}
```

---

### 3. PUT /api/emergency-contacts/:id
**Description:** Update existing emergency contact
**Authentication:** Bearer Token Required
**Method:** PUT

**URL Parameters:**
- `id`: Emergency contact ID

**Request Body:**
```javascript
{
  "name": "Jane Smith Updated",
  "phone": "+91 87654 32100",
  "email": "jane.updated@example.com",
  "relationship": "Colleague", 
  "isPrimary": true
}
```

**Business Logic:**
- If `isPrimary` is set to true, update other contacts to set isPrimary = false
- Only the user who owns the contact can update it
- Validate that the contact exists and belongs to the authenticated user

**Response:**
```javascript
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e4b0123456789xyz",
    "name": "Jane Smith Updated",
    "phone": "+91 87654 32100",
    "email": "jane.updated@example.com",
    "relationship": "Colleague",
    "isPrimary": true,
    // ... other fields
  },
  "message": "Emergency contact updated successfully"
}
```

---

### 4. DELETE /api/emergency-contacts/:id
**Description:** Delete emergency contact (soft delete)
**Authentication:** Bearer Token Required
**Method:** DELETE

**URL Parameters:**
- `id`: Emergency contact ID

**Business Logic:**
- Set `isActive` to false instead of hard delete
- If deleting primary contact, automatically set another contact as primary
- Only the user who owns the contact can delete it

**Response:**
```javascript
{
  "success": true,
  "message": "Emergency contact deleted successfully"
}
```

---

### 5. PUT /api/emergency-contacts/:id/primary
**Description:** Set specific contact as primary
**Authentication:** Bearer Token Required
**Method:** PUT

**URL Parameters:**
- `id`: Emergency contact ID

**Business Logic:**
- Set specified contact's `isPrimary` to true
- Set all other user's contacts' `isPrimary` to false
- Only one primary contact allowed per user

**Response:**
```javascript
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e4b0123456789xyz",
    "isPrimary": true,
    // ... other contact details
  },
  "message": "Primary contact updated successfully"
}
```

---

### 6. GET /api/emergency-contacts/primary
**Description:** Get primary emergency contact
**Authentication:** Bearer Token Required
**Method:** GET

**Response:**
```javascript
{
  "success": true,
  "data": {
    "_id": "64f7b8c9e4b0123456789abc",
    "name": "John Doe",
    "phone": "+91 98765 43210",
    "email": "john@example.com",
    "relationship": "Family Member",
    "isPrimary": true
  },
  "message": "Primary contact retrieved successfully"
}
```

## Error Responses

### Common Error Codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (not contact owner)
- `404`: Not Found (contact doesn't exist)
- `409`: Conflict (duplicate primary contact)
- `500`: Internal Server Error

### Example Error Response:
```javascript
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    },
    {
      "field": "name", 
      "message": "Name is required"
    }
  ]
}
```

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** Users can only access their own emergency contacts
3. **Input Validation:** Sanitize all inputs to prevent injection attacks
4. **Rate Limiting:** Implement rate limiting (e.g., 100 requests/hour per user)
5. **Data Encryption:** Store sensitive data encrypted at rest
6. **Audit Logs:** Log all CRUD operations for security tracking

## Integration with SOS System

When SOS alert is triggered, the system should:
1. Get user's primary emergency contact first
2. Fall back to other active contacts if primary unavailable  
3. Send notifications via SMS, email, and push notifications
4. Log all emergency contact attempts

## Database Indexes

```javascript
// Recommended indexes for performance
db.emergencycontacts.createIndex({ "userId": 1 })
db.emergencycontacts.createIndex({ "userId": 1, "isPrimary": 1 })
db.emergencycontacts.createIndex({ "userId": 1, "isActive": 1 })
```

## Sample Implementation (Node.js/Express)

```javascript
// Emergency Contacts Controller
const EmergencyContact = require('../models/EmergencyContact');

// GET /api/emergency-contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      userId: req.user._id,
      isActive: true
    }).sort({ isPrimary: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: contacts,
      message: 'Emergency contacts retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency contacts'
    });
  }
};

// POST /api/emergency-contacts
exports.addContact = async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;
    
    // If setting as primary, update others
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { userId: req.user._id },
        { $set: { isPrimary: false } }
      );
    }
    
    const contact = new EmergencyContact({
      userId: req.user._id,
      name,
      phone,
      email,
      relationship,
      isPrimary: isPrimary || false
    });
    
    await contact.save();
    
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Emergency contact added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

## Testing Requirements

1. **Unit Tests:** Test all CRUD operations
2. **Integration Tests:** Test with authentication middleware
3. **Load Tests:** Test performance with multiple contacts
4. **Security Tests:** Test unauthorized access attempts
5. **Edge Cases:** Test primary contact logic, validation errors

This specification provides a complete foundation for implementing emergency contacts functionality in your tourist safety application.