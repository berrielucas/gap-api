const express = require("express");
const authBodyMiddleware = require("../middlewares/authBody");
const User = require("../models/User");

const router = express.Router();
router.use(authBodyMiddleware);

router.get("/listAllUsers", async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    const users = await User.find();
    res.status(200).send({ success: true, data: users });
});

module.exports = (app) => app.use("/User", router);