import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const rawToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!rawToken || typeof rawToken !== "string") {
    throw new ApiError(401, "Unauthorized request - token missing");
  }

  try {
    const decodedToken = jwt.verify(rawToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Unauthorized request - user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});
