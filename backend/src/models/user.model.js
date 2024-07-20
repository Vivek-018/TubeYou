import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    avatar: {
      type: String, // cloudnary url
      required: true,
    },
    coverimage: {
      type: String, // cloudnary url
      required: true,
    },
    password: {
      type: String,
      required: ["true", "password must be required"],
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = bcrypt.hash(this.password, 8);
//     return next();
//   } else {
//     return next();
//   }
// });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// userSchema.methods.isPasswordCorrect = async function(password){
//   return await bcrypt.compare(password, this.password)
// }

userSchema.methods.genrateAccessToken = function () {
 return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SCERET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.genrateRefreshToken = function () {
 return  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SCRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );

 
};
export const User = mongoose.model("User", userSchema);
    