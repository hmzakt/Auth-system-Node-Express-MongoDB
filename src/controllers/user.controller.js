import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { createReadStream } from "fs";
import { ApiRespose } from "../utils/apiResponse.js";

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
    console.log("email : ", email);

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are compulsary")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong")
    }

return res.status(201).json(
    new ApiRespose(200, createdUser, "User registered successfully")
)


})

export { registerUser };