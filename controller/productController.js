const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async(req, res)=>{
  try{
    if(req.body.title){
        req.body.slug = slugify(req.body.title);
    }
     const newProduct = await Product.create(req.body);
     res.json(newProduct);
  }catch(error){
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async(req, res) => {
     const {id} = req.params;
    	try{
        	if(req.body.title){
            	req.body.slug = slugify(req.body.title);
        	}
         	const updatedProduct = await Product.findByIdAndUpdate(id , req.body, {new: true});
         	res.json(updatedProduct);
      	}catch(error){
        	throw new Error(error);
      	}
})

const removeProduct = asyncHandler(async(req, res) => {
    const {id} = req.params;
       try{
            const deletedProduct = await Product.findByIdAndDelete(id);
            res.json(deletedProduct);
         }catch(error){
           throw new Error(error);
         }
})

const getSingleProduct = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    try{
     const findProduct = await Product.findById(id);
     res.json(findProduct);
    }catch(error){
      throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async(req, res)=>{
    try{

      // filtering 
      const queryObj = {...req.query};
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el)=> delete queryObj[el]);
       
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      let query = Product.find(JSON.parse(queryStr));

     //sorting
     if(req.query.sort){
      const sortBy = req.query.sort.split(',').join(" ");
       query = query.sort(sortBy);
     }else{
        query = query.sort("-createdAt")
     }

     //limiting the field
     if(req.query.fields){
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
     }else{
      query = query.select('-__v')
     }

     //pagination

     const page = req.query.page; //this shows in which page number
     const limit = req.query.limit; //how many product you want to show in the page
     const skip = (page - 1) * limit; //calculating how many items we have to skip
     query = query.skip(skip).limit(limit);
     //if skipped product is greater tHan product we have
     if(req.query.page){
      const productCount = await Product.countDocuments();
      if(skip>= productCount) throw new Error("This Page Doesnot exist.");
     }
          
     const allProducts = await query;
     res.json(allProducts);
    }catch(error){
      throw new Error(error);
    }
});


module.exports = {createProduct, getSingleProduct, getAllProduct, updateProduct, removeProduct};