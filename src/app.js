const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors());


// مهم جدًا قبل الـ routes
app.use(express.json());


// Routes
const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);



app.get("/", (req, res) => {
    res.json({
        message: "Masaar API Running"
    });
});
const userRoutes =
    require("./routes/user.routes");


app.use(
    "/api/user",
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