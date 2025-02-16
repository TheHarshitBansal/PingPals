import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressRateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import connectToDb from './config/dbConfig.js';
import userRoutes from './routes/user.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import {Server} from 'socket.io'
import User from './models/user.model.js';
import FriendReq from './models/friendReq.model.js';
import path from 'path';
import Message from './models/message.model.js';

const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
})

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET, POST, PUT, DELETE, PATCH',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(morgan('dev'));

const limited = expressRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests, please try again later.'
});

app.use('/api', limited);

app.use('/api/v1/user', userRoutes);

app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectToDb();
})

io.on('connection', async (socket) => {
    const user_id = socket.handshake.query['user_id'];
    const socket_id = socket.id;
    console.log('User connected', user_id, socket_id);

    if(user_id){
        await User.findByIdAndUpdate(user_id, {socket_id, status: 'Online'});
    }

    //INFO: Socket Events
    socket.on('friend_request', async (data) => {
        const receiver = await User.findById(data.receiver).select('socket_id');
        const sender = await User.findById(data.sender).select('socket_id');

        //INFO: Creating a friend request
        await FriendReq.create({
            sender: data.sender,
            receiver: data.receiver
        }); 

        receiver.requests.push(data.sender);
        await receiver.save();

        //INFO: Emitting a received friend request to the receiver
        io.to(receiver.socket_id).emit('new_friend_request', {
            message: 'You have received a new friend request',
        }); 

        //INFO: Emitting a sent friend request to the sender
        io.to(sender.socket_id).emit('friend_request_sent', {
            message: 'Friend request sent successfully',
        });
    })


    //INFO: Accepting a friend request
    socket.on('accept_request', async (data) => {
        const request = await FriendReq.findById(data.request_id);

        //INFO: Updating the friends list of the sender
        await User.findByIdAndUpdate(request.sender, {$push: {friends: request.receiver}});
        //INFO: Updating the friends list of the receiver
        await User.findByIdAndUpdate(request.receiver, {$push: {friends: request.sender}});

        await FriendReq.findByIdAndDelete(data.request_id);

        //INFO: Emitting a friend request accepted to the sender
        io.to(request.sender).emit('request_accepted', {
            message: 'Friend request accepted successfully',
        });
        //INFO: Emitting a friend request accepted to the receiver
        io.to(request.receiver).emit('request_accepted', {
            message: 'Friend request accepted successfully',
        });
    })

    //INFO: Fetching Chats
    socket.on('get_direct_chats', async ({user_id}, callback) => {
        const allConversations = await Message.find({participants: {$all: [user_id]}}).populate('participants', 'name avatar, status _id');

        callback(allConversations);
    })

        //INFO: Handle Text & Link Messages
        socket.on('text_message', async (data) => {

        })

        //INFO: Handling File & Media Messages
        socket.on("file_message", async (data) =>  {
             
            const fileExtension = path.extname(data.file.name);
            const fileName = `${Date.now()}_${Math.floor(Math.random()*1000)}${fileExtension}`
        })

        socket.on('end', async (data) => {
            await User.findByIdAndUpdate(data.user_id, {status: 'Offline'});
            console.log("Closing socket connection");
            socket.disconnect(0);
        })
    })


export default app;