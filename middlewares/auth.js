const isLoggedIn = async (req, res, next) => {
  console.log("logged IN user")
  console.log(req.session)
  if (req.session && req.session.user) {
   res.locals.user=req.session.user;
   return next();
  }
  res.redirect("/login"); // redirect to login.ejs if not logged in
};

const isLoggedOut = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      res.redirect("/admin")
    } else {
      next()
    }
  } catch (error) {
    next()
  }
}

const isAdmin = async (req, res, next) => {
  if (req.session.user?.role=="admin") {
    return next();
  }else{
    res.status(403).json({
      success:false,
      message:"Failed: Unauthenticated - Admin is Permitted Only",
      error:"Unauthenticated - Only Admin is permissable"
    }); 
  }
};

module.exports = { isAdmin, isLoggedIn, isLoggedOut }

