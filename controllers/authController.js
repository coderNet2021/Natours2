const { promisify } = require('util');
//const util = require('util');
const jwt = require('jsonwebtoken');

const User = require('./../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

/*
function signToken(id) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      },
      function (err, token) {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}


exports.signup = catchAysnc(async (req, res, next) => {
  const newUser = await User.create(req.body);
 
  //we can now use 'await'
  const token = await signToken(newUser._id);
 
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

*/

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);

  // 3) If everything ok, send token to client
  res.status(201).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // console.log('test test %%%%%%%%%% %%%% %%%% %%% test');
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; //the second element
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  //verifying if someone have manipulate the data
  //or token expired.
  //now use verify
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //manipulated JWT :
  //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjU0ODgyOTQ3NTIwOWRkOTc4N2JnYiIsImlhdCI6MTYyOTgzMzUzNSwiZXhwIjoxNjM3NjA5NTM1fQ.HLIeh88AkVKG-TxsY_Bs0hsDgLbfodYfnGW4A-vaKWw
  //correct JWT :
  //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjU0ODgyOTQ3NTIwOWRkOTc4N2JnYiIsImlhdCI6MTYyOTgzMzUzNSwiZXhwIjoxNjM3NjA5NTM1fQ.HLIeh88AkVKG-TxsY_Bs0hsDgLbfodYfnGW4A-vaKWw
  console.log(decoded);
  // 3) Check if user still exists
  // const currentUser = await User.findById(decoded.id);
  // if (!currentUser) {
  //   return next(
  //     new AppError(
  //       'The user belonging to this token does no longer exist.',
  //       401
  //     )
  //   );
  // }

  // 4) Check if user changed password after the token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password! Please log in again.', 401)
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  //req.user = currentUser;
  next();
});
