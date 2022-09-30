const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers["x-access-token"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, keys.secretOrKey, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = decoded.id;
    next();
  });
};
