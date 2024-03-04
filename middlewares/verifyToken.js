const jwt = require("jsonwebtoken");
module.exports.verifyToken = async (req, res, next) => {
    // THIS CODE IS TO VERIFY USER IF JWT IS IN THE COOKIES
    const cookies = cookiesToMap(req.headers.cookie);
    const session = cookies.get("session");
    const decodedSession = decodeURIComponent(session);
    const { id_token: idToken } = JSON.parse(decodedSession);
    
    if (!idToken) {
        return res.status(401).json({ message: "Unauthorized - Missing session" });
    }

    jwt.verify(String(idToken), process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized - Invalid session" });
        }
        const {__v, iat, exp, ...user} = payload;
        req.user = user;
    });

    
    // THE COMMENTED CODE IS JWT VERIFICATION IF THE JWT IS IN THE AUTH HEADER

    // const auth = req.headers.authorization || req.headers.Authorization;
    // const parts = auth.split(" ");
    // const idToken = parts[1];

    // if (!idToken || parts.length !== 2 || parts[0] !== "Bearer") {
    //     return res.status(401).json({ message: "Unauthorize" });
    // }

    // jwt.verify(String(idToken), process.env.JWT_SECRET, (err, payload) => {
    //     if (err) {
    //         return res.status(401).json({ message: "Unauthorize" });
    //     }
    //     const {__v, iat, exp, ...user} = payload;
    //     req.user = user;
    // });

    next();
}

module.exports.refreshtoken = async (req, res, next) => {
    const cookies = cookiesToMap(req.headers.cookie);
    const session = cookies.get("session");
    const decodedSession = decodeURIComponent(session);
    const { refresh_token: refreshToken } = JSON.parse(decodedSession);

    if (!refreshToken) {
        res.status(403).json({message: "Unauthorized - Missing session"})
    }

    jwt.verify(String(refreshToken), process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized - Invalid session" });
        }

        res.clearCookie("session");
        req.cookies["session"] = "";


        // GENERATE NEW TOKEN
        const newToken = jwt.sign({ id: payload.id}, process.env.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: "30m"
        });

        const sessionCookie = {
            id_token: newToken,
            refresh_token: refreshToken
        };

        // set an http only cookie
        // res.cookie accepts name, value, and options
        // options include maxAge, expires, path, signed, httpOnly
        res.cookie("session", JSON.stringify(sessionCookie), {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
        });

        const {__v, iat, exp, ...user} = payload;
        req.user = user;

        next();
    });
}

function cookiesToMap (cookies) {
    const cookieMap = new Map();
    const parts = cookies?.split(";");
    parts?.forEach(cookie => {
        const cookieParts = cookie.split("=");
        cookieMap.set(cookieParts[0].trim(), cookieParts[1].trim());
    })
    return cookieMap;
}