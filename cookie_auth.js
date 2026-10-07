// JWT Authentication with Cookies

const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

const SECRET_KEY = "my_secret_key";

app.use(express.json());
app.use(cookieParser());

const users = [
    {
        id: 1,
        username: "harsh",
        password: "12345"
    }
];

// Create JWT
function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        SECRET_KEY,
        {
            expiresIn: "1h"
        }
    );
}

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        user =>
            user.username === username &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const token = createToken(user);

    console.log("JWT Created:", token);

    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    });

    res.json({
        message: "Login successful"
    });
});

// Authentication Middleware
function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}

// Protected Profile
app.get("/profile", authenticate, (req, res) => {
    console.log("Logged-in User:", req.user);

    res.json({
        message: "Welcome to your profile",
        user: req.user
    });
});

// Logout
app.post("/logout", (req, res) => {

    res.clearCookie("token");

    console.log("User logged out");

    res.json({
        message: "Logout successful"
    });
});

// Home
app.get("/", (req, res) => {
    res.send("Cookie Authentication Server is Running");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
