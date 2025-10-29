const User = require("../model/user");

// const createUser = async (req, res) => {
//     try {
//         console.log("request recieved");
//         console.log(req.body)
//         const user=await User.create(req.body)
//         res.status(200).json({
//             success:true,
//             message:"Success: Request  successed",
//             data:user
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message || "Failed: Server Error",
//         })
//     }
// }


const checkUser = async (req, res) => {
    try {
        const {email,password}=req.body
        const user=await User.findOne({email:email})
        if(user && user.password==password){
            if(!req.session.user){
                req.session.user=null
            }
            req.session.user={
                email:user.email,
                userName:user.userName,
                role:user.role,
                userId:user._id
            }
            return res.status(200).json({
                message:"Successfully loggedIn",
                success:true,
                redirect:"/dashboard"
            })
        }else{

            return res.status(401).json({
                success:false,
                message:"Failed: Invalid Credentials"
            })
        }
        } catch (error) {
        res.status(500).json({
            success: false,
            message:"Internal Server Error",
            error: error.message || "Failed: Server Error",
        })
    }
}




module.exports={checkUser}