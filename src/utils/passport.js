const passport = require('passport');
const mongoose = require('mongoose');
const passportJWT = require('passport-jwt');

const JwtStrategy = passportJWT.Strategy;
const { ExtractJwt } = passportJWT;

const User = mongoose.model('User');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
  algorithms: ['HS256'],
};

passport.use(new JwtStrategy(options, async (jwt, done) => {
  const user = await User.findOne({ _id: jwt._id });
  return done(null, user);
}));
