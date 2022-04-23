// require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { cors } = require('./middleware/cors');
const { apiLogger } = require('./config/winston.config');
const passport = require('passport');
const app = express();
const port = 3000
app.use(helmet());
app.use(cors);
app.use(morgan('combined', { stream: apiLogger.stream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use('/static', express.static('public'))
// configure passportß
require('./config/passport.config');

//connect to Mongo DB
mongoose.connect('mongodb://suvam_rox:SOh3TbYhx8ypJPxmt1oOfLsuvamrox@134.209.152.137:27017/medicWorldTest', {
  useCreateIndex: true,
  useNewUrlParser: true,
  // useUnifiedTopology: true
}).then(
  () => {
    /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
    console.log('Databes Is Ready For Rox&Roll');
  },
  (err) => {
    console.log(err);
    /** handle initial connection error */
  }
);

app.use('/v1/', require('./routes/user.route'));
app.use('/v1/', require('./routes/admin.router'));
app.use('/v1/', require('./routes/product.router'));
app.use('/v1/', require('./routes/payment.router'));


//Error handler middleware
app.use(errorHandler);

// module.exports = app;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

