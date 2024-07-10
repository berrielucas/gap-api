const jwt = require("jsonwebtoken");

module.exports = (data) => {
  const { tokenUser } = data;
  if (!tokenUser) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }
  jwt.verify(tokenUser, process.env._SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return {
        success: false,
        error: "Unauthorized - Token invalid",
      };
    }
    return {
      sucess: true,
      data: {
        idUser: decoded.id,
        emailUser: decoded.email,
      },
    };
  });
};
