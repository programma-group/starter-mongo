const express = require('express');
const { catchErrors } = require('../utils/errorHandlers');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');

const router = express.Router();

router.post(
  '/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.authenticate,
  authController.login,
);

router.post('/login', authController.authenticate, authController.login);
router.post('/password/lost', catchErrors(authController.lostPassword));
router.post(
  '/password/verify',
  catchErrors(authController.validatePasswordToken),
  authController.validatePasswordReturn,
);
router.post(
  '/password/reset',
  catchErrors(authController.validatePasswordToken),
  authController.validatePasswordInput,
  catchErrors(authController.resetPassword),
  catchErrors(authController.cleanPasswordResetData),
);

module.exports = router;
