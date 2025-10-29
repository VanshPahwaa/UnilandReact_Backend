const express=require("express")
const router=express.Router()
const User=require("../model/user.js")
const {createUser,checkUser}=require("../controller/auth.js")

// router.post("/register",createUser)

router.post("/login",checkUser)

router.post("/logout", (req, res) => {
  try{
    req.session.destroy(err => {
      if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.clearCookie("connect.sid", {
      path: "/",      
      httpOnly: true,  
      sameSite: "lax", 
      secure: false   
    });
      return res.json({
        success:true,
        message:"Successfully logged out",
        redirect:"/login"
      });
  });
}catch(error){
  res.json({
    success:false,
    message:"Internal Server Error",
    error:error.message || "Internal Server Error"
  })
}
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session?.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    console.log("in auth me")

    const user = await User.findById(req.session.user.userId).select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      user: { userId: user._id, userName: user.userName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


module.exports=router