import { model, Schema } from 'mongoose'

const friendReqSchema = new Schema({
    sender: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const FriendReq = model('FriendReq', friendReqSchema);

export default FriendReq;