const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
