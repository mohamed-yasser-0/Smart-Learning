function asyncWrapper(Fn){
    return (req,res,next)=>{
        Fn(req,res,next).catch((err)=>{
            next(err);
        })
    }
}
module.exports = asyncWrapper