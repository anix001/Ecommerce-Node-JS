const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-Handler");

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
    const  { id } = req.params;
    try{
      const updatedUser =await User.findByIdAndUpdate(
        id,
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

module.exports = {createUser, loginUser, getAllUsers, getSingleUser, removeSingleUser, updateUser};