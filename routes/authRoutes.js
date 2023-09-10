const express = require('express');
const { createUser, loginUser, getAllUsers, getSingleUser, removeSingleUser, updateUser  } = require('../controller/userController');
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users", getAllUsers);
router.get("/:id", getSingleUser);
router.delete("/:id", removeSingleUser);
router.put("/:id", updateUser);


module.exports = router;