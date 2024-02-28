const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { verifyToken } = require("../middlewares/verifyToken");
const userController = require("../controllers/user");

router.post("/signup", wrapAsync(userController.signup));
router.post("/signin", wrapAsync(userController.login));
router.get("/me", verifyToken, wrapAsync(userController.me));

module.exports = router;