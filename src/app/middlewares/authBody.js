const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const { tokenUser } = req.body;
    if (!tokenUser){
        return res.status(401).send({ success: false, error:'Unauthorized' });
    }
    jwt.verify( tokenUser, process.env._SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ success: false, error:'Unauthorized - Token invalid' });
        }
        req.userId = decoded.id;
        req.userEmail = decoded.email
        return next();
    })
};