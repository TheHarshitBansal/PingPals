import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        select: false, 
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
    },
    verified:{
        type: Boolean,
        default: false
    },
    otp:{
        type: Number,
        length: 4,
    },
    otpExpires:{
        type: Date,
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now();

    next(); 
})

userSchema.pre('save', async function(next){
    if(!this.isModified('otp')) return next();
    this.otp = await bcrypt.hash(this.otp, 12);

    next(); 
})

userSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; //NOTE: 1 hour

    return resetToken;
}

const User = model('User', userSchema);

export default User;