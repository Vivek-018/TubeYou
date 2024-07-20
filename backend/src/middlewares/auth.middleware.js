// import jwt from "jsonwebtoken";
// import ApiError from "../utils/ApiError.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import { User } from "../models/user.model.js";
// export const verifyJWT = asyncHandler(async (req, _, next) => {
//   try {
//     const token =
//       req.cookies?.accessToken ||
//       req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       throw new ApiError(401, "Uauthorized request");
//     }

//     console.log(process.env.ACCESS_TOKEN_SCERET);
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SCERET);
//     const user = await User.findById(decodedToken?._id).select(
//       "-password -refreshToken"
//     );

//     if (!user) {
//       // dicuss about frontend
//       throw new ApiError(401, "Invalid Access Token");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid access Token");
//   }
// });

// chat Gpt code
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Log the headers and cookies to debug token extraction
    // console.log("Request Headers:", req.headers);
    // console.log("Request Cookies:", req.cookies);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    // console.log(process.env.ACCESS_TOKEN_SCERET);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SCERET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
