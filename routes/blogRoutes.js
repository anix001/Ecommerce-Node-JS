const express = require("express");
const { createBlog, updateBlog, getAllBlogs, getSingleBlog, deleteSingleBlog, likeBlog, dislikeTheBlog } = require("../controller/blogController");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");
const router = express.Router();


router.get("/", getAllBlogs); 
router.get("/:id", getSingleBlog); 
router.post("/likes", authMiddleware, likeBlog);
router.post("/dislikes", authMiddleware, dislikeTheBlog);
router.post("/", authMiddleware, isAdmin, createBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteSingleBlog);

module.exports = router;