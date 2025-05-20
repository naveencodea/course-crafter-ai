"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth/auth.controller");
const auth_1 = require("../middleware/auth");
const auth_validator_1 = require("../middleware/validators/auth.validator");
const router = express_1.default.Router();
// Public routes
router.post('/register', auth_validator_1.validateRegister, auth_controller_1.register);
router.post('/login', auth_validator_1.validateLogin, auth_controller_1.login);
router.post('/forgotpassword', auth_validator_1.validateForgotPassword, auth_controller_1.forgotPassword);
router.put('/resetpassword/:resettoken', auth_validator_1.validateResetPassword, auth_controller_1.resetPassword);
router.get('/verifyemail/:verificationtoken', auth_controller_1.verifyEmail);
router.post('/google', auth_controller_1.googleAuth);
// Protected routes
router.use(auth_1.protect);
router.get('/me', auth_controller_1.getMe);
router.put('/updatedetails', auth_controller_1.updateDetails);
router.put('/updatepassword', auth_validator_1.validateUpdatePassword, auth_controller_1.updatePassword);
router.get('/logout', auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map