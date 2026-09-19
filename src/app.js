const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([
    "https://alaasohail.com",
    "https://www.alaasohail.com",
    ...configuredOrigins,
]);

app.use(helmet());
app.use(
    cors({
        origin(origin, callback) {
            // Native mobile apps/Postman normally have no browser Origin header.
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, try again later",
    },
});
app.use("/api", limiter);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PlantCare API Running",
    });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/plants", require("./routes/plant.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api", require("./routes/post_interaction.routes"));
app.use("/api", require("./routes/care.routes"));
app.use("/api", require("./routes/reminder.routes"));
app.use("/api", require("./routes/ai.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/weather", require("./routes/weather.routes"));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Server error",
    });
});

module.exports = app;
