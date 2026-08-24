const express = require("express");
const cors = require("cors");

const app = express();


// =====================================================
// PROXY
// =====================================================

// Render / Cloudflare Proxy
app.set("trust proxy", 1);


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// STATIC FILES
// =====================================================

app.use(
    "/uploads",
    express.static("uploads")
);


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "PlantCare API Running"
    });

});


// =====================================================
// ROUTES
// =====================================================


// =====================
// AUTH
// =====================

const authRoutes =
    require("./routes/auth.routes");

app.use(
    "/api/auth",
    authRoutes
);


// =====================
// USERS
// =====================

const userRoutes =
    require("./routes/user.routes");

app.use(
    "/api/users",
    userRoutes
);


// =====================
// PLANTS
// =====================

const plantRoutes =
    require("./routes/plant.routes");

app.use(
    "/api/plants",
    plantRoutes
);

const postRoutes = require("./routes/post.routes");

app.use("/api/posts", postRoutes);
// =====================
// CARE
// =====================

const careRoutes =
    require("./routes/care.routes");

app.use(
    "/api",
    careRoutes
);


// =====================
// REMINDERS
// =====================

const reminderRoutes =
    require("./routes/reminder.routes");

app.use(
    "/api",
    reminderRoutes
);


// =====================
// AI ANALYSIS
// =====================

const aiRoutes =
    require("./routes/ai.routes");

app.use(
    "/api",
    aiRoutes
);

// =====================
// POSTS
// =====================

const postRoutes =
    require("./routes/post.routes");

app.use(
    "/api/posts",
    postRoutes
);


// =====================
// POST INTERACTIONS
// =====================

const postInteractionRoutes =
    require("./routes/post_interaction.routes");

app.use(
    "/api",
    postInteractionRoutes
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found"

    });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Server error"

    });

});


module.exports = app;