const axios = require('axios');

exports.userLogInOtpSend = (ph, otp, cb) => {
    axios.get(`https://2factor.in/API/V1/74001ac0-54d4-11ea-9fa5-0200cd936042/SMS/${ph}/${otp}/t2`)
        .then(function (response) {
            cb(null, response.data);
        }).catch((err) => {
            cb(err, null)
        });
}