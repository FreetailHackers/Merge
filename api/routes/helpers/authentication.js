const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers["x-access-token"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.SECRETORKEY, (err, decoded) => {
    if (err) {
      return res.sendStatus(401);
    }
    req.user = decoded.id;
    next();
  });
};
