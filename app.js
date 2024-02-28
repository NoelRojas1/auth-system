if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");

const PORT = 5000;

const app = express();

app.use(express.json());

app.use("/", (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("home route")
})

app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('DB Connection established.');
    app.listen(PORT, () => { console.log(`Listening on port ${5000}`); });
}).catch((e) => console.log(e.message));