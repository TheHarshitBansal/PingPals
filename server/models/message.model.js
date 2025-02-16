import { model, Schema } from "mongoose";

const messageSchema = new Schema({
    participants: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    messages: [{
        sender: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['Text', 'Media', 'Document', 'Link '],
            default: 'Text'
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        content: String,
        file: {
            type: String,
            default: null
        }
    }]
})

const Message = model('Message', messageSchema);

export default Message;