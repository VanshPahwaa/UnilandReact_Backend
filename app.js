require("dotenv").config({
    path: `.env.${process.env.NODE_ENV || "development"}`
});
const express = require("express")
const app = express()
const cors = require("cors")
const MongoStore = require("connect-mongo");
const dbStart = require("./config/db.js");
const { upload } = require("./config/multerconfig.js");
const session = require('express-session');
const path = require("path");

const errorMiddleware = require("./middlewares/errorMiddleware.js");


// const frontEndRouter = require("./routes/frontend.js")
// const authRouter = require("./routes/auth.js")
// const propertyRouter = require("./routes/backend/property.js")
// const propertyAttributeRouter = require("./routes/propertyAttributeRoutes.js")
// const adminRouter = require("./routes/backend/admin.js")
// const agentRouter = require("./routes/backend/agent.js")
// const locationRouter = require("./routes/backend/location.js")
// const leadRouter = require("./routes/backend/lead.js")
// const bankRouter = require("./routes/backend/bank.js")
// const paymentRouter = require("./routes/backend/paymentGateway.js")
// const appointmentRouter = require("./routes/backend/appointment.js")
// const dashboardRouter = require("./routes/dashboard/dashboard.js")
// const homeRouter=require("./routes/home.js");
const appRouter = require("./routes/route.js");


//  configuration
// app.set("trust proxy",1)
app.use(cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

// app.use(cors({
//     origin: "*",
//     credentials: true
// }));


// //middleware's
app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));

// // app.use("/URL_PREFIX", express.static("FOLDER_NAME"));


app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,// initialize session id only when any value is assigned to session object by server
    resave: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: "sessions",
        ttl: 60// use to manipulate the duration of cookie on db it is 60 minutes
    }),
    cookie: {
        // if production is true then request can be sent on https
        // secure: process.env.PRODUCTION=="true", //if true, cookie will be set on only on https  // not okey
        secure: false,
        httpOnly: true,// if set to true, will not be accessible by js
        maxAge: 60 * 60 * 1000, // time limit on client side
        // sameSite:process.env.PRODUCTION?"None":'lax',
        sameSite: 'lax',
        path: "/"// cookie will be sent by the browser to the server for every request starting with preceded by path /
    }

}))



//db connecting
dbStart().then(() => {
    //running server
    app.listen(process.env.PORT, '0.0.0.0', (req, res) => {
        console.log(process.env.PORT)
        console.log("app is running on port 5000");
    })
}).catch(error => {
    console.log("Error", error)
})


app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});



//routes
app.use("/", appRouter);
// app.use("/dashboard", dashboardRouter)
// app.use("/auth",authRouter);
// app.use("/",frontEndRouter);
// app.use("/propertyAttribute",propertyAttributeRouter);
// app.use("/backend/lead",leadRouter)
// app.use("/backend/admin",adminRouter)
// app.use("/backend/location",locationRouter)
// app.use("/backend/bank",bankRouter)
// app.use("/backend/property",propertyRouter);
// app.use("/backend/payment",paymentRouter);
// app.use("/backend/appointment",appointmentRouter);


// app.use("/backend/agent",agentRouter)


app.use((req, res) => {
    // in case route not found 
    console.log("in not found method")
    res.status(404).json({
        success: false,
        message: "Not Found"
    })
});


// app.use(errorMiddleware);

