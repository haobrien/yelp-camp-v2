const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users')


// ROUTES
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser)

module.exports = router