const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = require('../app/models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email: email });
                if (!user) {
                    return done(null, false, { message: 'Email chưa được đăng ký' });
                }

                const isMatch = (password === user.password);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Mật khẩu không đúng' });
                }
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
