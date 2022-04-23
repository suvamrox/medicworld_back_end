
'use strict';
const appRoot = require('app-root-path'),
    fs = require('fs'),
    jwt = require('jsonwebtoken');


exports.userJWT = (data, cb) => {
    fs.readFile(`${appRoot}/keys/rsa.private.key`, (errFile, privateKey) => {
        if (errFile) {
            console.log(errFile);
            cb(errFile, null);
        } else {
            jwt.sign({ userID: data._id, userType: data.type }, privateKey, { algorithm: 'RS256', expiresIn: '25920h' }, function (err, token) {
                cb(err, token);
            });
        }
    });
}

exports.adminJWT = (data, cb) => {
    fs.readFile(`${appRoot}/keys/rsa.private.key`, (errFile, privateKey) => {
        if (errFile) {
            console.log(errFile);
            cb(errFile, null);
        } else {
            jwt.sign({ userID: data._id, userType: data.type }, privateKey, { algorithm: 'RS256', expiresIn: '25920h' }, function (err, token) {
                cb(err, token);
            });
        }
    });
}