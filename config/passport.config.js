var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    passport = require('passport'),
    appRoot = require('app-root-path'),
    fs = require('fs'),
    User = require('../models/user.model'),
    Admin = require('../models/admin.model');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = fs.readFileSync(`${appRoot}/keys/rsa.public.key`);


//for user 
passport.use('userJWT', new JwtStrategy(opts, function (jwtPayload, done) {
    User.findById(jwtPayload.userID, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));

passport.use('adminJWT', new JwtStrategy(opts, function (jwtPayload, done) {
    Admin.findById(jwtPayload.userID, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));