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
            enum: ['Text', 'Media', 'Document', 'Link', 'Separator', 'Reply'],
            default: 'Text'
        },
        createdAt: {
            type: String,
        },
        content: String,
        file: {
            type: String,
            default: null
        }
    }],
    lastMessage: {
        type: String,
        default: null,
    }
})

const Message = model('Message', messageSchema);

export default Message;