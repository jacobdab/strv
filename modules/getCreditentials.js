const jwt = require('jsonwebtoken');

function getCreditentials(req){
    let email;
        jwt.verify(req.cookies['jwt'], process.env.SECRET, function(err, decodedToken) {
            if(err) { console.log(err)}
            else {
                req.userId = decodedToken.email;
            }
        });
        email = req.userId;
        return email;
}


module.exports = getCreditentials;