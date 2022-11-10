require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");

var count = 0;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importing user context
const User = require("./model/user");

// Autorithation route
const auth = require("./middleware/auth");

app.use("/static", express.static('./static/'));
//app.use("/node_modules", express.static('./node_modules/'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/static/login.html");
});

app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/static/signup.html");
});

// Register
app.post("/register", async (req, res) => {

    try {
        const { name, email, pass } = req.body;
        if (!(email && pass && name)) {
            res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User already exist. Please login");
        }

        encryptedPassword = await bcrypt.hash(pass, 10);

        const user = await User.create({
            first_name: name,            
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        //create token
        const token = jwt.sign(
            { user_id: user._id, user: name, email: email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "10s",
            }
        );
            console.log(token.TOKEN_KEY);
        //save user token
        user.token = token;

        //return new user
        res
        .status(200)
        .cookie('tokens', token)
        .redirect('/welcome');

    } catch (err) {
        console.log(err);
    }
});

// Login
app.post("/login", async (req, res) => {

    try {
        const { email, pass} = req.body;

        //validate user input
        if (!(email && pass)) {
            res.status(400).send("All input is required");
            return;
        }

        //validate if user exist in our database
        const user = await User.findOne({ email });


        if (user && (await bcrypt.compare(pass, user.password))) {
            //create token
            const token = jwt.sign(
                { user_id: user._id, user: user.first_name, email: email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "10s",
                }
                
            );
            count = count + 1;
            //save user token
            user.token = token;
            console.log("hello world",auth);
            console.log("hello world",count);

            console.log("expire time 5 second");
            //to user
            res
                .status(200)
                .cookie('tokens', token)
                .redirect('/welcome');
            
        } else {
            res.status(400).send("Invalid credentials");
        }

    } catch (err) {
        console.log(err);
    }

});

app.get("/welcome", auth, (req, res) => {
    res.set('Content-Type', 'text/html')
    res.status(200).send("<body><center><h1>Welcome 👁</h1></center></body>");
    // res.sendFile(__dirname + "/static/index1.html");

});

app.get("/Python_Developer.html", auth, (req, res) => {
    // res.set('Content-Type', 'text/html')
    // res.status(200).send("<body><center><h1>Welcome 👁</h1></center></body>");
    res.sendFile(__dirname + "/static/Python_Developer.html");
});
app.get("/MERN_Developer", auth, (req, res) => {
    // res.set('Content-Type', 'text/html')
    // res.status(200).send("<body><center><h1>Welcome 👁</h1></center></body>");
    res.sendFile(__dirname + "/static/MERN_Developer.html");
});

app.get("/jquery.js", function(req, res) {
    res.sendFile(path.join(__dirname, '/node_modules/socket.io/client-dist/socket.io.js'));
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
    res.status(404).json({
        success: "false",
        message: "Page not found",
        error: {
            statusCode: 404,
            message: "You reached a route that is not defined on this server",
        },
    });
});

const team1NameSpace = io.of('/team1')
team1NameSpace.on('connect', (socket) => {
  //console.log('a user connected');
  socket.on('join', (data) => {
    socket.join(data.room);
    team1NameSpace.in(data.room).emit('chat message', 'New Person joined the room: '+data.room);

  });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('chat message', (data) => {
      console.log('message: ' + data.msg);
      team1NameSpace.in(data.room).emit('chat message', data.msg);
    });
  });

module.exports = app;
