const jwt = require("jsonwebtoken");
module.exports.verifyToken = async (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    const parts = auth.split(" ");
    const idToken = parts[1];

    if (!idToken || parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Unauthorize" });
    }

    jwt.verify(String(idToken), process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorize" });
        }
        const {__v, iat, exp, ...user} = payload;
        req.user = user;
    });

    next();
}