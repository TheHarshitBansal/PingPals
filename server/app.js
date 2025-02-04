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
        await User.findByIdAndUpdate(user_id, {socket_id});
    }

    //INFO: Socket Events
    socket.on('friend_request', async (data) => {
        const friend = await User.findById(data.friend_id);

        //TODO: Creating a friend request

        //INFO: Emitting a friend request to the friend
        io.to(friend.socket_id).emit('new_friend_request', {

        }); 
    })
})

export default app;