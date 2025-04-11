import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { createReadStream } from "fs";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId)=>
    {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend

    //validations - not empty
    //check if user already exists : username or email
    //check if files are there -  avatar and cover image 
    //upload them to cloudinary, avatar 
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const { fullName, email, username, password } = req.body


    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are compulsary")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImageLocalPath == req.files.coverImage[0]?.path)


        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

const loginUser = asyncHandler(async(req,res)=>{
        //req body->data
        //based on username or email
        //find the user and generate response if user not found
        //password check
        //generate and provide access and refresh token
        //send cookies
        //send response

        const {email, username, password} = req.body

        if(!username || !email){
            throw new ApiError(400, "Username or email  is required")
        }

       const user = await User.findOne({
            $or : [{username},{email}]
        })

        if(!user){
            throw new ApiError(404, "User does not exist")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(401,"Invalid user credentials")
        }

       const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)

       const loggedInUser = User.findById(user._id).select("-password -refreshToken")

       const options = {
        httpOnly : true,
        secure : true
       }

       return res.status(200)
       .cookie("Access Token", accessToken, options)
       .cookie("Refresh Token", refreshToken, options)
       .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"
        )
       )
})

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200),{}, "User Logged Out Successfully")
})

export {
     registerUser,
     loginUser,
     logoutUser,
 };