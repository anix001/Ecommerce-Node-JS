const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-Handler");
const { validateMongoDbId } = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const {sendEmail} = require('./emailController');
const  crypto  = require('crypto');
const jwt = require("jsonwebtoken");

//create user
const createUser = asyncHandler(
    async(req, res) => {
        const email = req.body.email;
        const findUser = await User.findOne({email:email});
    
        if(findUser == null){
            //Create a new User
            const newUser = await User.create(req.body);
            res.json(newUser);
        }else{
            throw new Error("User Already Existed");
        }
    }
)


//login user
const loginUser = asyncHandler(async(req, res)=>{
     const { email, password } = req.body;

    //  check if user exists or not 
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser._id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000
        });
     res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?.id)
     });
    }else{
        throw new Error("Invalid Credentials");
    }
});

//handle refreshToken

const handleRefreshToken = asyncHandler(async(req, res)=>{
  const cookie = req.cookies;
  if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({refreshToken});
  if(!user) throw new Error("No Refresh Token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded)=>{
    console.log(decoded)
    if(err || user.id !== decoded.id){
        throw new Error("There is something wrong with refresh token.");
    }else{
        const accessToken  = generateToken(user.id);
        res.json({
           accessToken 
        })
    }
  })
});


//logout functionality
const logoutHandler = asyncHandler(async(req, res)=>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:true
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken:"",
    });
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:true
    });
    return res.sendStatus(204); //forbidden
}) 


//get All User
const getAllUsers = asyncHandler(async(req, res)=>{
    try{
       const getUsers = await User.find();
       res.json(getUsers);
    }catch(error){
       throw new Error(error);
    }

})

//get a single user
const getSingleUser = asyncHandler(async(req, res)=>{
   const { id } = req.params;
   validateMongoDbId(id);
   try{
    const getAUser = await User.findById(id);
    res.json({
        getAUser
    })
   }catch(error){
      throw new Error(error);
   }
});

//remove a single user
const removeSingleUser = asyncHandler(async(req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    try{
     const removeUser = await User.findOneAndDelete(id);
     res.json({
        removeUser
     })
    }catch(error){
       throw new Error(error);
    }
 });


 const updateUser = asyncHandler(async(req, res)=>{
    const  { _id } = req.user;
    validateMongoDbId(_id);
    try{
      const updatedUser =await User.findByIdAndUpdate(
        _id,
        {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        },
        {
            new: true
        }
      );
      res.json({
        updatedUser
      });
    }catch(error){
        throw new Error(error);
    }
 })

 const blockUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try{
     const blockUser = await User.findByIdAndUpdate(
        id,
        {
            isBlocked:true,
        },
        {
            new:true,
        }
     );
     res.json({
        message:`User with id ${id} has been blocked.`
     });
    }catch(error){
        throw new Error(error);
    }
 });

 const unblockUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try{
     const unblockUser = await User.findByIdAndUpdate(
        id,
        {
            isBlocked:false,
        },
        {
            new:true,
        }
     );
     res.json({
        message:`User with id ${id} has been unblocked.`
     });
    }catch(error){
        throw new Error(error);
    }
 });

 const updatePassword = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    console.log("🚀 ~ file: userController.js:216 ~ updatePassword ~ user:", user)
    if(password){
        user.password  = password;
        const updatePassword = await user.save();
        res.json(updatePassword);
    }else{
        res.json(user);
    }
 })

 const forgotPasswordToken = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error(`User not found with email ${email}`);
    try{
       const token = await user.createPasswordResetToken();
       await user.save();
       const resetUrl = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="http://localhost:5000/api/user/reset-password/${token}">Click Here</a>.`;
       const data = {
        to:email,
        text: "Hey User",
        subject: "Forgot password Link",
        htm: resetUrl,
       };
       sendEmail(data);
       res.json(token);
    }catch(error){
        throw new Error(error);
    }
 });

 const resetPassword = asyncHandler(async(req, res)=>{
    const {token} = req.params;
    const {password} = req.body;
    const hashedToken =  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()},
    }); // if token get expires then we donot able to find user 
    if(!user) throw new Error("Token expired, Please try again letter.");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
 })

module.exports = {createUser, loginUser, getAllUsers, getSingleUser, removeSingleUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutHandler, updatePassword, forgotPasswordToken, resetPassword};