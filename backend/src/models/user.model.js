import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, trim: true, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      unique: [true, "Phone number is already in use"],
      trim: true,
      sparse: true,
      match: [
        /^\+?[1-9]{1,4}?[-.\s]?(\(?\d{1,4}?\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/,
        "Please fill a valid phone number",
      ],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["customer", "admin", "event-manager"],
      default: "customer",
    },
    organization: {
      type: String,
      trim: true,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
