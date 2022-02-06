const server = require('net').createServer();
const fs = require('fs');
const path = require('path');

const dirname = path.join(__dirname,'users.json');
let counter = 0;
let sockets = {};
let onlineUsers = {};
let allUsers = fs.readFile(dirname, (err, data) => {
    if (err && err.code == "ENOENT") {
        data = '[]'
        fs.writeFileSync(dirname,data);
    }
});

function timestamp() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()}`
}

const saveUser = (name) => {
    fs.readFile(dirname, (err, data) => {
        if (err && err.code == "ENOENT") {
            data = '[]'
            fs.writeFileSync(dirname,data);
        }

        console.log("User name")
        console.log(name);
        users = JSON.parse(data);
        if (users.indexOf(name) != -1) {
            console.log("User already registered!")
        } else {
            console.log("New user registered.")
            users.push(name);
            fs.writeFileSync(dirname,JSON.stringify(users));
        }
        console.log(name)
    })
}

server.on('connection', socket => {
    socket.id = counter++;

    console.log('Client connected');
    socket.write('Please type your name: ')

    socket.on('data', data => {
        if (!sockets[socket.id]) {
            socket.name = data.toString().trim();
            sockets[socket.id] = socket;
            saveUser(socket.name);
            onlineUsers[socket.name] = socket;
            socket.write('\n\n')
            socket.write(`Hello there ${socket.name}!!\n`)
            socket.write('Please type the person you would like to chat with: ')
            return;
        }

        if (!socket.chatWith) {
            if (!onlineUsers[data.toString().trim()]) {
                socket.write('User not online. Please wait for user login or type another person.\n')
            } else {
                socket.chatWith = [data.toString().trim()];
            }
            return
        }

        socket.chatWith.forEach((userName) => {
            targetSocket = onlineUsers[userName];
            targetSocket.write(`${socket.name} ${timestamp()}: `)
            targetSocket.write(data);
        });
    })

    socket.on('end', () => {
        console.log(`Client ${socket.name} disconnected`);
        delete sockets[socket.id];
        onlineUsers.splice(onlineUsers.indexOf(socket.name),1);
        console.log(`Available users: ${onlineUsers}`)
    })
});

server.listen(8000, () => console.log('Server bound'))