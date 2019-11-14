const db = require('../database/db')

module.exports = {
    add,
    find,
}

function add(user) {
    return db('users').insert(user, '*')
    // sqlite work-around, return added user
    .then(resp => {
        if (resp && resp[0]) return find({id: resp[0]})
    })
    .catch(err => {throw err})
}

function find(filter) {
    if (filter) return db('users').where(filter)
    else return db('users')
}