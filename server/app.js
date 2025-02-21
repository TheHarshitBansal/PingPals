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
import Message from './models/message.model.js';
import mongoose from 'mongoose';

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

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectToDb();
})

io.on('connection', async (socket) => {
    const user_id = socket.handshake.query['user_id'];
    const socket_id = socket.id;
    console.log('User connected', user_id, socket_id);

    if (!user_id || user_id === "undefined" || !mongoose.Types.ObjectId.isValid(user_id)) {
        console.error("Invalid user_id received:", user_id);
        return;
    }
        await User.findByIdAndUpdate(user_id, {socket_id, status: 'Online'});
        socket.broadcast.emit('database-changed');

    //INFO: Socket Events
    socket.on('friend_request', async (data) => {
        const receiver = await User.findByIdAndUpdate(data.receiver, {$push: {requests: data.sender}}).select('socket_id').exec();
        const sender = await User.findById(data.sender).select('socket_id').exec();

    //INFO: Creating a friend request
        await FriendReq.create({
            sender: sender.id,
            receiver: receiver.id,
        }); 

    //INFO: Emitting a received friend request to the receiver
    if(receiver && receiver.socket_id){
        io.to(receiver.socket_id).emit('new_friend_request', {
            message: 'You have received a new friend request',
        }); 
    }
        
    //INFO: Emitting a sent friend request to the sender
    if(sender && sender.socket_id){
        io.to(sender.socket_id).emit('friend_request_sent', {
            message: 'Friend request sent successfully',
        });
    }

    io.to(receiver.socket_id).emit('database-updated');
    io.to(sender.socket_id).emit('database-updated');
    })

    //INFO: Unsending a friend request
    socket.on('unsend_request', async (data) => {
        const receiver = await User.findByIdAndUpdate(data.receiver, {$pull: {requests: data.sender}});
        await FriendReq.findOneAndDelete({sender: data.sender, receiver: data.receiver});

        const sender = await User.findById(data.sender).select('socket_id').exec();

        if(sender && sender.socket_id){
        io.to(sender.socket_id).emit('request-unsend', {
            message: 'Friend request revoked',
        })
    }
    io.to(receiver.socket_id).emit('database-updated');
    io.to(sender.socket_id).emit('database-updated');
    })


    //INFO: Accepting a friend request
    socket.on('accept_request', async (data) => {
        //INFO: Updating the friends list of the sender
        const sender = await User.findByIdAndUpdate(data.sender, {$push: {friends: user_id}}, {new: true}).select('socket_id').exec();
        //INFO: Updating the friends list of the receiver
        await User.findByIdAndUpdate(user_id, {$pull: {requests: data.sender}}, {new: true})
        const receiver = await User.findByIdAndUpdate(user_id, {$push: {friends: data.sender}}, {new: true}).select('socket_id').exec();

        await FriendReq.findOneAndDelete({sender: data.sender, receiver: user_id});

        //INFO: Emitting a friend request accepted to the sender
        io.to(sender.socket_id).emit('request_accepted', {
            message: 'Friend request accepted successfully',
        });
        //INFO: Emitting a friend request accepted to the receiver
        io.to(receiver.socket_id).emit('request_accepted', {
            message: 'Friend request accepted successfully',
        });

        io.to(receiver.socket_id).emit('database-updated');
        io.to(sender.socket_id).emit('database-updated');
    })

    //INFO: Rejecting a friend request
    socket.on('reject_request', async (data) => {
        await FriendReq.findOneAndDelete({sender: data.sender, receiver: user_id});
        const receiver = await User.findByIdAndUpdate(user_id, {$pull: {requests: data.sender}}, {new: true}).select('socket_id').exec();
        const sender = await User.findById(data.sender).select('socket_id').exec();

        io.to(receiver.socket_id).emit('request_rejected', {
            message: 'Friend request rejected',
        });
        io.to(receiver.socket_id).emit('database-updated');
        io.to(sender.socket_id).emit('database-updated');
    })

    //INFO: Removing a friend
    socket.on('remove_friend', async (data) => {
        const sender = await User.findByIdAndUpdate(user_id, {$pull: {friends: data.receiver}}, {new: true}).select('socket_id').exec();
        const receiver = await User.findByIdAndUpdate(data.receiver, {$pull: {friends: user_id}}, {new: true}).select('socket_id').exec();

        io.to(receiver.socket_id).emit('database-updated');
        io.to(sender.socket_id).emit('database-updated');

        io.to(sender.socket_id).emit('friend_removed', {
            message: 'Friend removed successfully',
        })
    })

    //INFO: Starting a chat
    socket.on('start_chat', async (data) => {
        const existingChat = await Message.findOne({participants:{$size:2, $all:[user_id, data.receiver]}}).populate("participants", "name username avatar status").exec();

        if(!existingChat){
            let newChat = await Message.create({
                participants: [user_id, data.receiver],
                messages: [],
            });
            newChat = await newChat.populate("participants", "name username avatar status about _id");
            socket.emit('open_chat', newChat);
        } else {
            socket.emit('open_chat', existingChat);
        }
    })

    //INFO: Fetching Chats
    socket.on('get_direct_chats', async ({user_id}) => {
        const allConversations = await Message.find({participants: {$all: [user_id]}}).populate('participants', 'name username avatar status _id about');

        socket.emit('direct_chats', allConversations);
    })

    //INFO: Fetching Messages
    socket.on('get_messages', async ({conversation_id}) => {
        const conversation = await Message.findById(conversation_id);
        socket.emit('dispatch_messages', conversation?.messages);
    })

    //INFO: Handle Date Separator
    socket.on("message", async (data) => {
        try {
            const conversation = await Message.findById(data.conversation_id);
            if (!conversation) return;
    
            const formatDate = (date) => {
                const d = new Date(date);
                return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).slice(-2)}`;
            };
    
            const messageDate = new Date(); // Current date
            const lastMessageDate = conversation.lastMessage ? new Date(conversation.lastMessage) : null;
    
            if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
                conversation.messages.push({
                    type: "Separator",
                    createdAt: formatDate(messageDate),
                });
            }
    
            conversation.lastMessage = messageDate; // Store as a Date object
            await conversation.save();
        } catch (error) {
            console.error("Error handling message event:", error);
        }
    });

    //INFO: Handle Text Messages
    socket.on("text_message", async (data)=>{
        const conversation = await Message.findById(data.conversation_id);
        if(!conversation) return;

        // Function to format time as HH:MM
        const formatTime = (date) => {
            const d = new Date(date);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        const messageTime = formatTime(new Date()); // Get current time in HH:MM format

        conversation.messages.push({
            sender: user_id,
            receiver: data.receiver_id,
            content: data.content,
            createdAt: messageTime, // Store formatted time
        });

        await conversation.save();

        const receiverData = await User.findById(data.receiver_id).select('socket_id').exec();

        io.to(receiverData?.socket_id).emit('database-changed');
        io.emit('database-changed');
    })

    //     //INFO: Handling File & Media Messages
    //     socket.on("file_message", async (data) =>  {
             
    //         const fileExtension = path.extname(data.file.name);
    //         const fileName = `${Date.now()}_${Math.floor(Math.random()*1000)}${fileExtension}`
    //     })

    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${user_id} (${socket.id})`);
        await User.findByIdAndUpdate(user_id, { status: "Offline" });
        socket.broadcast.emit('database-changed');
    });
    })


export default app;