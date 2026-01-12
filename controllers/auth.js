const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, UnauthenticatedError} = require('../errors')



const register = async (req, res)=>{

    const {name, email, password} = req.body
    if(!name || !email || !password){
        throw new BadRequestError('please provide name, email and password')
    }

    // *** move it to middleware ***
    // const {name, email, password} = req.body

    // const salt = await bcrypt.genSalt(10)
    // const hashPassword = await bcrypt.hash(password, salt)

    // const tempUser = {name, email, password:hashPassword}
    // const user = await User.create({...tempUser})

    // const user = await User.create({...req.body})
    const user = await User.create({ name, email, password })
    const token = user.createJWT()

    // *** move it to middleware ***
    // const token = jwt.sign({userId:user._id, name:user.name}, 'jwtSecret', {expiresIn:'30d'})
    // res.send('register user')

    res.status(StatusCodes.CREATED).json({user:{name:user.name}, token})
}

const login = async (req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        throw new BadRequestError('please provide email and password')

    }

    const user = await User.findOne({email})
    if(!user){
        throw new UnauthenticatedError('Invalid credentials')

    }

     // compare password
    const isPasswordCorrect = await user.comparePassword(password)
    if(!isPasswordCorrect){
        throw new UnauthenticatedError('Invalid credentials')

    }

    const token = user.createJWT()
    res.status(StatusCodes.OK).json({user:{name:user.name}, token})

}

module.exports = {
    register,
    login
}

// 当某个 HTTP 请求 匹配到这个路由 时，
// Express 会 自动调用 register 函数，
// 然后通过 res.send() 把响应返回给客户端。