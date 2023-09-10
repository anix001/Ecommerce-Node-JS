const express = require('express');
const { createUser, loginUser, getAllUsers, getSingleUser, removeSingleUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutHandler } = require('../controller/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users", getAllUsers);
router.get("/refresh-token", handleRefreshToken);
router.get("/logout", logoutHandler);
router.get("/:id", authMiddleware, isAdmin, getSingleUser);
router.delete("/:id", authMiddleware, removeSingleUser);
router.put("/update", authMiddleware, updateUser);
router.put("/block/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;