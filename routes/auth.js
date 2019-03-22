const express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    passport = require("passport"),
    bcrypt = require('bcrypt'),
    getCredit = require('../modules/getCreditentials'),
    User = require('../schema/User');

require('dotenv').config();

/* GET register page. */
router.get('/register', async (req, res) => {
    let credit = req.cookies['jwt'] ? await getCredit(req) : undefined;
    res.render('auth/register', {credit});
});

/* GET login page. */
router.get('/login', async (req, res) => {
    let credit = req.cookies['jwt'] ? await getCredit(req) : undefined;
    res.render('auth/login', {credit});
});

/* POST register page. */
router.post('/register', async (req, res) => {
    const {email, password} = req.body;
    const hashCost = 10;
    try {
        const passwordHash = await bcrypt.hash(password, hashCost);
        const userDocument = new User({email, passwordHash});
        await userDocument.save();
        req.flash("success", 'Hello');
        res.status(200).redirect('/');
    } catch (err) {
        console.log(err);
        req.flash("error", 'User with that email already exists');
        res.status(400).redirect('/');
    }
});

/* POST login. */
router.post('/login', (req, res) => {
    passport.authenticate('local', {session: false}, (err, user) => {
        if (err || !user) {
            req.flash('error', 'Wrong email/password');
            return res.status(400).redirect('/user/login');
        } else {
            const payload = {
                email: user.email,
                expires: Date.now() + parseInt(process.env.JWT_EXPIRATION),
            };

            req.login(payload, {session: false}, (err) => {
                if (err) {
                    req.flash("error", err.message);
                    return res.status(400).redirect('/user/login');
                }
                const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);
                //secure: true,
                res.cookie('jwt', token, {httpOnly: true, expires: new Date(Date.now() + 3600000)});
                req.flash("success", 'Welcome back');
                return res.status(200).redirect('/');
            });
        }
    })(req, res);
});


module.exports = router;
