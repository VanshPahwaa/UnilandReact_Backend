const AppError = require("../utils/AppError");
const User = require("../model/user");
const asyncHandler=require("../middlewares/asyncHandler");

const logout = asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  res.clearCookie("connect.sid", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.json({ success: true, message: "Successfully logged out", redirect: "/login" });
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.session?.user) throw new AppError("Not authenticated", 401);
  const user = await User.findById(req.session.user.userId).select("-password -__v");
  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({
    success: true,
    user: { userId: user._id, userName: user.userName, email: user.email, role: user.role },
  });
});

module.exports = { logout, getMe };
