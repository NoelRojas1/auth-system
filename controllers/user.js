const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

module.exports.signup = async (req, res) => {
    const {name, email, password} = req.body;

    const existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(400).json({message: "User already exists."});
    }

    const hashPassword = bcrypt.hashSync(password);

    const user = new User({
        name,
        email,
        password: hashPassword
    });

    await user.save();

    // to avoid returning password to requester
    const { _doc: { password: p, ...rest} } = user;

    return res.status(201).json({ ...rest });
}

module.exports.login = async (req, res) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (!existingUser) {
        return res.status(404).json({message: "User not found"});
    }

    const isValidPassword = bcrypt.compareSync(password, existingUser.password);
    if (!isValidPassword) {
        return res.status(400).json({message: "Invalid email or password."});
    }
    
    const { _doc: { password: p, ...rest} } = existingUser; 
    const idToken = jwt.sign({id: rest._id}, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "30m"
    });

    // set an http only cookie
    // res.cookie accepts name, value, and options
    // options include maxAge, expires, path, signed, httpOnly
    res.cookie("session", idToken, {
        expires: new Date(Date.now() + (1000 * 60 * 30)),
        httpOnly: true,
        path: "/",
        sameSite: true,
        secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({ message: "Successfully logged in.", id_token: idToken });
}

module.exports.me = async (req, res) => {
    const { id } = req.user;

    // -password will help us not to return the password
    const user = await User.findById(id, "-password");

    if (!user) {
        return resr.status(404).json({message: "User not found."});
    }
    return res.status(200).json(user);
};