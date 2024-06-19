const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).send({ success: false, error:'No token provided' });
    }
    const parts = authHeader.split(' ');
    if (!parts.length===2) {
        return res.status(401).send({ success: false, error:'Token error' });
    }
    const [scheme,token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ success: false, error:'Token malformated' });
    }
    jwt.verify( token, process.env._SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ success: false, error:'Token invalid' });
        }
        req.userId = decoded.id;
        // req.userEmail = decoded.email
        return next();
    })
};