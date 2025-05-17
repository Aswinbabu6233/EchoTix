const isAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.role === "user") {
    console.log(
      "User is authenticated" +
        req.session.user.username +
        " Role: " +
        req.session.user.role
    );
    next();
  } else {
    console.log("User is not authenticated");
    res.redirect("/user/login");
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    console.log(
      "User is authenticated" +
        req.session.user.username +
        " Role: " +
        req.session.user.role
    );
    next();
  } else {
    console.log("User is not authenticated");
    res.redirect("/admin/login");
  }
};

module.exports = { isAuthenticated, isAdmin };
