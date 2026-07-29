const express = require("express");
const cors = require("cors");

const app = express();


// Render Proxy
app.set("trust proxy", 1);


// Middlewares
app.use(cors());
app.use(express.json());


// Static Files
app.use(
    "/uploads",
    express.static("uploads")
);


// Home
app.get("/", (req, res) => {

    res.json({
        message: "PlantCare API Running"
    });

});



// =====================
// Routes
// =====================


// Auth
const authRoutes =
    require("./routes/auth.routes");

app.use(
    "/api/auth",
    authRoutes
);


// Users
const userRoutes =
    require("./routes/user.routes");

app.use(
    "/api/users",
    userRoutes
);


// Plants
const plantRoutes =
    require("./routes/plant.routes");

app.use(
    "/api/plants",
    plantRoutes
);


// Care
const careRoutes =
    require("./routes/care.routes");

app.use(
    "/api",
    careRoutes
);


// Reminders
const reminderRoutes =
    require("./routes/reminder.routes");

app.use(
    "/api",
    reminderRoutes
);


// AI Analysis
const aiRoutes =
    require("./routes/ai.routes");

app.use(
    "/api",
    aiRoutes
);



// 404 Handler
app.use((req, res) => {

    res.status(404).json({

        success:false,

        message:"Route not found"

    });

});



// Error Handler
app.use((err, req, res, next) => {

    console.log(err);

    res.status(500).json({

        success:false,

        message:"Server error"

    });

});


module.exports = app;