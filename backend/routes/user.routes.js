const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  getUserByEmail,
  getUserByPhone
} = require('../controller/user.controller');

const {
  validateUserCreation,
  validateUserUpdate,
  validateObjectId
} = require('../middleware/validation');

// Routes with validation middleware
router.post('/', validateUserCreation, createUser);                    // POST /api/users
router.get('/', getAllUsers);                                          // GET /api/users
router.get('/:id', validateObjectId, getUserById);                     // GET /api/users/:id
router.put('/:id', validateObjectId, validateUserUpdate, updateUser);  // PUT /api/users/:id
router.delete('/:id', validateObjectId, deleteUser);                   // DELETE /api/users/:id
router.patch('/:id/verify', validateObjectId, verifyUser);             // PATCH /api/users/:id/verify
router.get('/email/:email', getUserByEmail);                           // GET /api/users/email/:email
router.get('/phone/:phone', getUserByPhone);                           // GET /api/users/phone/:phone

module.exports = router;