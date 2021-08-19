const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(`uncaught Exception!! shutting Down`);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreatedIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log(con.connections);
    console.log('DB connected!');
  });

// const testTour = new TourTest({
//   name: 'test tour from mac no price',
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log(err);
//   });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(`unhandled Rejection!! shutting Down`);
  console.log(err.name, err.message);
  //console.log(err);
  server.close(() => {
    //after unhandled exception we need to crash our app
    // bcz node become in a not clean state
    //=> must crash the app
    process.exit(1);
  });
});



//for installing the ndb
//PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 sudo npm install -g ndb --unsafe-perm=true --allow-root ftw
