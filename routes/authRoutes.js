const express = require('express');
const { createUser, loginUser, getAllUsers, getSingleUser, removeSingleUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutHandler, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getUserWishlist, saveAddress, userCart, getUserCart, emptyCart, applyCoupon } = require('../controller/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/all-users", getAllUsers);
router.get("/refresh-token", handleRefreshToken);
router.get("/logout", logoutHandler);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.post("/cart",authMiddleware, userCart);
router.get("/cart",authMiddleware, getUserCart);
router.post("/cart/applycoupon",authMiddleware, applyCoupon);
router.delete("/empty-cart",authMiddleware, emptyCart);
router.get("/wishlist", authMiddleware, getUserWishlist);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/password", authMiddleware,updatePassword);
router.get("/:id", authMiddleware, isAdmin, getSingleUser);
router.delete("/:id", authMiddleware, removeSingleUser);
router.put("/update", authMiddleware, updateUser);
router.put("/block/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;