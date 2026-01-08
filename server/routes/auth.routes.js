import express from "express";
import {
    login,
    register,
    getUsers,
    createUser,
    lockUser,
    unlockUser,
    resetPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// User Management Routes
router.get("/users", getUsers);
router.post("/users", createUser);
router.post("/users/:id/lock", lockUser);
router.post("/users/:id/unlock", unlockUser);
router.post("/users/:id/reset-password", resetPassword);

export default router;
