import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import User from '../models/user.model'
import config from '../config/config'
import jwtDecode from 'jwt-decode'
const signin = (req, res) => {
    User.findOne({'email': req.body.email},(err, user) => {
        if(err || !user){
            return res.send({error: 'User not found'})
        }
        if(!user.authenticate(req.body.password)){
            return res.send({error: 'Email and password do not match'})
        }
        const token = jwt.sign({_id: user._id, name:user.name}, config.secret)
        res.cookie('userJwtToken', token, {expire: new Date()+999, httpOnly:true})
        res.send({
            token,
            user: {
                _id:user._id, 
                name: user.name, 
                username: user.username,
                favorites:user.favorites
            }
        })
    })
}

const signinFacebookUser = (req, res) => {
    User.findOne({'loggedWithFacebook': true},(err, user) => {
        if(err || !user){
            return res.send({error: 'User not found'})
        }
        const token = jwt.sign({_id: user._id, name:user.name}, config.secret)
        res.cookie('userJwtToken', token, {expire: new Date()+999, httpOnly:true})
        res.send({
                _id:user._id, 
                name: user.name, 
                username: user.username,
                favorites:user.favorites,
                sessions:user.sessions,
                mindfullMinutes:user.mindfullMinutes 
        })
    })
}

const signout = (req, res) => {
    res.clearCookie('userJwtToken')
    res.send({message:'User signed out'})
}

const requireSignin = expressJwt({
    secret:config.secret,
    algorithms:['HS256'],
    userProperty: 'auth',
})

const hasAuthorization = (req, res, next) => {
    if(!req.cookies.userJwtToken){
        return res.send({error:'User not signed'})
    }else if(jwtDecode(req.cookies.userJwtToken).role !== 'admin'){
        return res.send({error:'User not authorized'})
    }
    next()
}

export default {signin, signout, hasAuthorization, requireSignin, signinFacebookUser}


