import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import env from "../config/env.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.error("User already exists", 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const { password: _, ...userData } = user._doc;

    res.created(
      {
        ...userData,
      },
      "User registered successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.error("Invalid credentials", 401);

    const token = generateToken(user._id, user.role);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user._doc;

    res.success(
      {
        ...userData,
      },
      "Login Successful"
    );
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.success({}, "User logged out successfully");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const { password: _, ...userData } = req.user._doc;
    
    res.success(
      {
        ...userData,
      },
      "User data retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};
