const express = require('express');
const router = express.Router();
const {
  createGroup,
  applyToGroup,
  approveMember,
  getGroups,
  getGroupMembers,
  sendGroupMessage,
  getGroupMessages,
  getUserGroups
} = require('../controllers/groupController');
const auth = require('../middlewares/auth');

// Group routes
router.post('/', auth, createGroup);
router.post('/:id/apply', auth, applyToGroup);
router.post('/:id/approve', auth, approveMember);
router.post('/:id/messages', auth, sendGroupMessage);
router.get('/', auth, getGroups);
router.get('/user', auth, getUserGroups);
router.get('/:id/members', auth, getGroupMembers);
router.get('/:id/messages', auth, getGroupMessages);

module.exports = router;