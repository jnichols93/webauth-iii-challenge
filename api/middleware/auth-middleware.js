const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const usersDb = require('../users-model')

const secret = process.env.SECRET || 'secret key'

module.exports = {
    validateReqBody,
    validateUnique,
    hashPassword,
    validateUsername,
    validatePassword,
    validateToken,
}

function validateReqBody(req, res, next) {
    if (!req.body) return res.status(400).json({message: 'Missing content application/json'})

    for (let prop of ['username', 'password', 'department']) {
        if (!req.body[prop]) return res.status(400).json({message: 'Missing required property: ' + prop})

        if (typeof req.body[prop] != 'string') return res.status(400).json({message: `Property ${prop} must be a string`})
    }

    next()
}

function validateUnique(req, res, next) {
    const username = req.body.username
    
    usersDb.find({username})
        .then(resp => {
            if (resp && resp.length) return res.status(409).json({message: `Username ${username} is already in use. Please use something else.`})
            next()
        })
        .catch(err => {
            console.error(err)
            res.sendStatus(500)
        })
}

function hashPassword(req, res, next) {
    const password = req.body.password

    bcrypt.hash(password,16)
        .then(hash => {
            res.locals.hash = hash
            next()
        })
        .catch(err => {
            console.error(err)
            res.sendStatus(500)
        })
}

function validateUsername(req, res, next) {
    const username = req.body.username

    usersDb.find({username})
        .then(resp => {
            if (resp && resp[0]) {
                res.locals.user = resp[0]
                next()
            }
            else res.status(401).json({message: 'You shall not pass!'})
        })
        .catch(err => {
            console.error(err)
            res.sendStatus(500)
        })
}

function validatePassword(req, res, next) {
    bcrypt.compare(req.body.password, res.locals.user.password, (err, match) => {
        if (err) {
            console.error(err)
            res.sendStatus(500)
        }
        else {
            if (match) next()
            else res.status(401).json({message: 'You shall not pass!'})
        }
    })
}

function validateToken(req, res, next) {
    if (!req.headers || !req.headers.authorization) {
        return res.status(400).json({message: 'Missing authorization header'})
    }

    jwt.verify(req.headers.authorization, secret, (err, decoded) => {
        if (err) {
            console.error(err)
            res.status(401).json({message: 'Invalid Credentials'})
        }
        else {
            const id = decoded.id
            usersDb.find({id})
                .then(resp => {
                    if (resp && resp[0]) {
                        res.locals.user = resp[0]
                        next()
                    }
                    else res.status(401).json({message: 'You shall not pass!'})
                })
                .catch(err => {
                    console.error(err)
                    res.sendStatus(500)
                })
        }
    })
}