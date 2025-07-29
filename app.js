
const express = require("express")
const app = express();
const indexRouter = require("./routes/indexRoutes")
const path = require("path")
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

let waitingUsers= [];
let rooms = {};

io.on("connection", function(socket){
    
    socket.on("joinroom",  function(){

        if(waitingUsers.length > 0){

            let partner = waitingUsers.shift();
            const roomname = `${socket.id}-${partner.id}`

            socket.join(roomname);
            partner.join(roomname);

            io.to(roomname).emit("joined", roomname)

        }else{
            waitingUsers.push(socket)
        }
    })   
    
    
    socket.on("disconnect", function(){

       const index = waitingUsers.findIndex((waitingUser)=> waitingUser.id === socket.id)

       waitingUsers.splice(index, 1); 

    })


    socket.on("message", function(data){
        socket.broadcast.to(data.room).emit("message", data.message)
    })

})

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))


app.use("/", indexRouter)

server.listen(3000)