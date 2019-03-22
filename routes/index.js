const express = require('express'),
    firebase = require('firebase'),
    getCredit = require('../modules/getCreditentials'),
    router = express.Router();


/* GET home page. */
router.get('/', async (req, res) => {
    let credit = req.cookies['jwt'] ? await getCredit(req) : undefined;
    if (credit != undefined) {
        let path = credit.toString().replace(/\./g, ',');
        var userReference = firebase.database().ref("/contacts/" + path);
        userReference.on("value",
            (snapshot) => {
                let snap = snapshot;
                userReference.off("value");
                res.render('index', {credit, snap});
            },
            function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
    } else {
        res.render('index', {credit});
    }
});

router.get('/addContact', async (req, res) => {
    let credit = req.cookies['jwt'] ? await getCredit(req) : undefined;
    res.render('addContact', {credit});
});

//Create new instance
router.post('/', async (req, res) => {
    let credit = req.cookies['jwt'] ? await getCredit(req) : undefined;
    let path = credit.toString().replace(/\./g, ',')
    const {clientName, contact, address, email} = req.body;

    var referencePath = '/contacts/' + path + '/';
    var userReference = firebase.database().ref(referencePath).push({clientName, contact, address, email}, (err) => {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
        } else {
            req.flash("success", 'Contact Added');
            res.redirect('/')
        }
    });
});


module.exports = router;
