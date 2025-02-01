import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, 'Name is required']
    },
    username:{
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username is already taken'],
        validate: {
            validator: (value) => {
                return /^[a-z0-9_-]{3,15}+$/.test(value);
            },
            message: 'Username can only contain letters, numbers, and underscores/hyphe ns'
        }
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'User with this email already exists'],
        validate: 
            {validator:(value)=>{
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: 'Invalid email address'
        }
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        validate: {
            validator: (value) => {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value);
            },
            message: 'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number'
        }
    },
    avatar:{
        type: String,
    },
    about:{
        type: String,
    },
    passwordChangedAt:{
        type: Date,
    },
    passwordResetToken:{
        type: String,
    },
    passwordResetExpires:{
        type: Date,
    },
    createdAt:{
        type: Date,
    },
    updatedAt:{
        type: Date,
    }
})

const User = new model('User', userSchema);

export default User;