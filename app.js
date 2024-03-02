if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require('cors')

const userRoutes = require("./routes/user");

const PORT = 5000;

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5173/",
]

const corsOptionsDelegate = function (req, callback) {
    const origin = req.header('Origin') || req.header('origin');
    console.log('Origin', origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, { 
            origin: true,
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true,
            exposedHeaders: ['set-cookie'],
            cookie: {
                sameSite: 'Lax'
            }
        });
    } else {
        callback(new Error('Not Allowed by CORS'), {
            origin: false
        })
    }
}

app.options('*', cors());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(cookieParser());

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