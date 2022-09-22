const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const { authenticateJWT } = require("./api/controllers/auth");
require("./configs/env.config");
require("./configs/db.config");

//middleware
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(cors({origin: true}));

// API PATH

// middleware that is specific to this router
app.use( async(req, res, next) => {
    console.log("\x1b[31m%s\x1b[0m", "Request URL", req?.url);
    if(req?.url === "/" || req?.url === "/api" || req?.url == "/api/user/login" || req?.url == "/api/user/signup"){
        next();
    }else{
        await authenticateJWT(req, res, next);
        if(req?.auth){
            next();
        }else{
            const err = new Error("User is unauthorized!!!");
            err.status = 401;
            return next(err);
        }
    }
    
});
// console.log({paths});

// auth middleware
require("./paths/route_path.js")(app);

// route_paths?.map(route_path => app.use('/api', route_path));

// MongoDB Connection With Mongoose
global.appRoot = path.resolve(__dirname);
app.use('/api/static', express.static('uploads'));


app.listen(process.env.PORT || 8000, () => {
    console.log("Node server started at http://localhost:" + process.env.PORT || 8000);
});
