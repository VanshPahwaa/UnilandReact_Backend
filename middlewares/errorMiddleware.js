const errorMiddlware=(err,req,res,next)=>{
    console.log(err);
    if(!err?.statusCode){
        err.statusCode=500;
    }
    res.status(err.statusCode).json({
        success:false,
        message:err?.message || "Internal Server Error"
    })
}

module.exports = errorMiddlware;