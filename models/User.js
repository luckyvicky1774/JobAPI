const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        require:[true, 'please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email:{
        type:String,
        require:[true, 'please provide email'],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'please provide valid email'],
        unique: true,
    },
    password:{
        type:String,
        require:[true, 'please provide password'],
        minlength: 6,
    },
})
// In Mongoose pre-save middleware, we use a regular function instead of an arrow function 
// so that this correctly refers to the document being saved, 
// and we must call next() to allow the save operation to continue（upgrade can omit）
UserSchema.pre('save', async function() {

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

})
// create an instance method of schema
UserSchema.methods.createJWT = function(){

    // return jwt.sign({userId:this._id, name:this.name}, 'jwtSecret', {expiresIn:'30d'})
    return jwt.sign({userId:this._id, name:this.name}, 
        process.env.JWT_SECRET, 
        {expiresIn:process.env.JWT_LIFETIME})

}

UserSchema.methods.comparePassword = async function (canditatePassword) {

    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
    
}

module.exports = mongoose.model('User', UserSchema)