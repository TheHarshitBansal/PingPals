import {Schema, model} from 'mongoose';

const callSchema = new Schema({
    participants: [
        {
            type: Schema.ObjectId,
            ref: 'User'
        }
    ],
    from:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    to:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    verdict:{
        type: String,
        enum: ['Accepted', 'Denied', 'Missed', 'Busy'],
    },
    type:{
        type: String,
        enum: ['Voice', 'Video'],
    },
    status:{
        type: String,
        enum: ['Ongoing', 'Ended'],
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: Date,
})

const Call = model('Call', callSchema);

export default Call;