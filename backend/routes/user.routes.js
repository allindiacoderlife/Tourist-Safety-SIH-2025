const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  getUserByEmail,
  getUserByPhone,
  uploadProfilePicture
} = require('../controller/user.controller');

const {
  validateUserCreation,
  validateUserUpdate,
  validateObjectId
} = require('../middleware/validation');

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Routes with validation middleware
router.post('/', validateUserCreation, createUser);                    // POST /api/users
router.get('/', getAllUsers);                                          // GET /api/users
router.get('/:id', validateObjectId, getUserById);                     // GET /api/users/:id
router.put('/:id', validateObjectId, validateUserUpdate, updateUser);  // PUT /api/users/:id
router.delete('/:id', validateObjectId, deleteUser);                   // DELETE /api/users/:id
router.patch('/:id/verify', validateObjectId, verifyUser);             // PATCH /api/users/:id/verify
router.get('/email/:email', getUserByEmail);                           // GET /api/users/email/:email
router.get('/phone/:phone', getUserByPhone);                           // GET /api/users/phone/:phone
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture); // POST /api/users/profile-picture

module.exports = router;