const express = require("express");
const cors = require("cors");

const app = express();


app.set("trust proxy", 1);

app.use(express.json());


// Routes
const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);



app.get("/", (req, res) => {
    res.json({
        "message": "PlantCare API Running"
    });
});
const userRoutes =
    require("./routes/user.routes");


app.use(
    "/api/users",
    userRoutes
);
const plantRoutes =
    require("./routes/plant.routes");


app.use(
    "/api/plants",
    plantRoutes
);

const careRoutes =
    require("./routes/care.routes");


app.use(

    "/api",

    careRoutes

);

const reminderRoutes =
    require("./routes/reminder.routes");


app.use(
    "/api",
    reminderRoutes
);

const aiRoutes =
    require("./routes/ai.routes");

app.use(
    "/uploads",
    express.static("uploads")
);

app.use(

    "/api/ai",

    aiRoutes

);


module.exports = app;