const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const {validateReqBody, validateUnique, hashPassword, validateUsername, validatePassword, validateToken} = require('./middleware/auth-middleware')
const usersDb = require('./users-model')

const server = express()

const secret = process.env.SECRET || 'secret key'

// middleware
server.use(helmet())
server.use(cors())
server.use(express.json())

// routes
server.post('/api/register', validateReqBody, validateUnique, hashPassword, (req, res) => {
    const {username, department} = req.body
    const password = res.locals.hash

    usersDb.add({username, password, department})
        .then(resp => {
            if (resp && resp[0]) {
                const {id, username, department} = resp[0]
                const user = {id, username, department}
                const token = jwt.sign({id}, secret, {expiresIn: '18h'})
                res.status(201).json({user, token})
            }
            else {
                throw Error('No user')
            }
        })
        .catch(err => {
            console.error(err)
            res.sendStatus(500)
        })
})

server.post('/api/login', validateReqBody, validateUsername, validatePassword,  (req, res) => {
    const {id, username, department} = res.locals.user
    const user = {id, username, department}
    const token = jwt.sign({id}, secret, {expiresIn: '18h'})
    res.json({user, token})
})

server.get('/api/users', validateToken, (req, res) => {
    usersDb.find()
    .then(resp => {
        if (resp) {
            res.json(resp
                .filter(({department}) => department === res.locals.user.department) // only user's department
                .map(({id, username, department}) => ({id, username, department})) // sanitize password
            )
        }
        else {
            throw Error('No users')
        }
    })
    .catch(err => {
        console.error(err)
        res.sendStatus(500)
    })
})

module.exports = server