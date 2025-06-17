import { User } from "../models/auth.model.js";
import { ApiError } from "../utlis/apiError.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import asyncHandler from "../utlis/asyncHandler.js";
import { uploadOnCloudinary } from "../utlis/fileUpload.js";
import {
  sendResetPasswordEmail,
  sendVerificationCode,
  wellcomeEmail,
} from "../libs/mailsender.lib.js";
import { generateAccessTokenAndRefreshToken } from "../utlis/generateAccesRefreshToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(
      400,
      `${!fullName ? "fullName" : !email ? "Email" : "Password"} is required.`
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Email is not valid");
  }

  // const avatar = req.file.path;
  // if (!avatar) {
  //   throw new ApiError(400, "avatar is required");
  // }

  // const avatarUploadCloudniary = await uploadOnCloudinary(
  //   avatarLocalPath
  // );

  // if (!avatarUploadCloudniary) {
  //   throw new ApiError(501, "avatar uploading error");
  // }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(408, "User already exists");
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const expiry = new Date(Date.now() + 59 * 1000); // 59 seconds expiry for testing

  // const baseUrl = `${req.protocol}://${req.get("host")}`;
  // const avatarLocalPath = `${baseUrl}/images/${avatar}`

  const user = await User.create({
    fullName,
    email,
    password,
    // avatar:avatarLocalPath,
    verificationCode: verificationCode,
    verificationCodeExpires: expiry,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -verificationCode -verificationCodeExpires"
  );

  await sendVerificationCode(user.email, verificationCode);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User Registered Successfully"
      )
    );
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(402, "Verification code is required");
  }

  const numericCode = Number(code);
  if (isNaN(numericCode)) {
    throw new ApiError(400, "Verification code must be a number");
  }

  const user = await User.findOne({ verificationCode: numericCode });

  if (!user) {
    throw new ApiError(403, "Invalid or expired verification code");
  }

  // Check expiry
  if (
    user.verificationCodeExpires &&
    user.verificationCodeExpires < new Date()
  ) {
    throw new ApiError(
      410,
      "Verification code has expired. Please request a new one."
    );
  }

  if (user.isVerified) {
    throw new ApiError(409, "User is already verified");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  // Mark as verified
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.refreshToken = refreshToken;
  await user.save();

  // Generate tokens

  // Set tokens in cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  // Send welcome email
  await wellcomeEmail(user.email, user.fullName);

  // Cleaned user data
  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Send response
  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: userData,
          accessToken,
          refreshToken,
        },
        "Email verified successfully"
      )
    );
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(404, "userId is missing");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(403, "User not found");
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const expiry = new Date(Date.now() + 30 * 1000);

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = expiry;
  await user.save({ validateBeforeSave: false });

  await sendVerificationCode(user.email, verificationCode);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { verificationCode }, "Resent OTP verification")
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "User name or email is required");
  }

  // const user = await User.findOne({
  //   $or: [{ email }],
  // });
  const user = await User.findOne({ $or: [{ email }] }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn successfully"
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(403, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const resetUrl = `${
    process.env.FRONTEND_URL
  }/reset-password?token=${encodeURIComponent(resetToken)}`;

  await sendResetPasswordEmail(email, resetUrl);

  res
    .status(200)
    .json(
      new ApiResponse(200, resetUrl, "Reset link has been sent to your email")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = decodeURIComponent(req.query.token);

  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "Both password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // This will trigger the pre-save hook to properly hash the password
  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user using the decoded refresh token's user ID
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if the refresh token stored in the user matches the incoming token
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    // Generate new access token and refresh token
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true, // For security reasons, don't allow JS access
      secure: true, // Ensure it works only over HTTPS in production
    };

    // Send new tokens in the response cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // Fixed typo here
      .cookie("refreshToken", newRefreshToken, options) // Make sure you're passing newRefreshToken here
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Error refreshing token");
  }
});

export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const file = req.file;

    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(404, "User not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (fullName) {
      user.fullName = fullName;
    }

    const localPath = file?.path;
    if (!localPath && !user.profilePic) {
      throw new ApiError(400, "Profile picture is required");
    }
    if (localPath) {
      const uploadpic = await uploadOnCloudinary(localPath);
      user.profilePic = uploadpic.secure_url; // Use secure_url
      // const uploadpic = await cloudinary.uploader.upload(localPath, {
      //   resource_type: "image", // Make sure this is set
      //   folder: "profilePics", // Optional: for organization
      // });
    }

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
};

export const checkAuth = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetch succesfully"));
});
