import User from "../models/user.model.js";

/**
 * Verify an event manager (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with success/error message
 */
export const verifyUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Validate user ID format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Find the user by ID
        const user = await User.findById(userId).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is an event manager or admin
        if (user.role !== "event-manager" && user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: 'Only event managers and admins can be verified'
            });
        }

        // Check if already verified
        if (user.verified) {
            return res.status(200).json({
                success: true,
                message: 'User is already verified',
                data: user
            });
        }

        // Update verification status
        user.verified = true;
        user.verifiedAt = new Date();
        await user.save();

        // Send success response
        return res.status(200).json({
            success: true,
            message: 'User verified successfully',
            data: user
        });

    } catch (error) {
        console.error('Error verifying user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify user',
            error: error.message
        });
    }
};

/**
 * Unverify an event manager (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with success/error message
 */
export const unverifyUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Validate user ID format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Find the user by ID
        const user = await User.findById(userId).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is an event manager or admin
        if (user.role !== "event-manager" && user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: 'Only event managers and admins can be unverified'
            });
        }

        // Check if already unverified
        if (!user.verified) {
            return res.status(200).json({
                success: true,
                message: 'User is already unverified',
                data: user
            });
        }

        // Update verification status
        user.verified = false;
        user.verifiedAt = null;
        await user.save();

        // Send success response
        return res.status(200).json({
            success: true,
            message: 'User unverified successfully',
            data: user
        });

    } catch (error) {
        console.error('Error unverifying user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to unverify user',
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const {
            search,
            order,
            sortBy,
            page = 1,
            limit = 2,
            role,
            organization,
            verified,
        } = req.query;

        const queryFilter = {};

        // Exclude admin users
        queryFilter.role = { $ne: "admin" };

        if (verified !== undefined) queryFilter.verified = verified === "true";
        if (organization)
            queryFilter.organization = { $regex: new RegExp(organization, "i") };

        if (role) {
            // Handle both single role and comma-separated roles
            const roles = Array.isArray(role) ? role : role.split(',');
            // Remove "admin" from requested roles just in case
            const filteredRoles = roles.filter(r => r !== "admin");

            if (filteredRoles.length > 1) {
                queryFilter.role = { $in: filteredRoles };
            } else if (filteredRoles.length === 1) {
                queryFilter.role = filteredRoles[0];
            }
        }

        if (search) {
            queryFilter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { organization: { $regex: search, $options: "i" } },
            ];
        }

        const pageNum = parseInt(page);
        const pageLimit = parseInt(limit);
        const skip = (pageNum - 1) * pageLimit;

        let sortOptions = {};
        const sortOrder = order === "asc" ? 1 : -1;

        const fieldMap = {
            updatedAt: "updatedAt",
            createdAt: "createdAt",
            name: "name",
        };

        const sortField = fieldMap[sortBy] || "name";

        sortOptions[sortField] = sortOrder;

        if (sortField !== "createdAt") {
            sortOptions["createdAt"] = -1;
        }

        const users = await User.find(queryFilter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLimit)
            .select("-password");

        const totalUsers = await User.countDocuments(queryFilter);

        res.success(
            {
                users: users || [],
                pagination: {
                    total: totalUsers,
                    page: pageNum,
                    limit: pageLimit,
                    totalPages: Math.ceil(totalUsers / pageLimit),
                },
            },
            users.length ? "Users fetched successfully" : "No users found"
        );
    } catch (err) {
        next(err);
    }
};


export const singleUser = async (req, res, next) => {
    try {
        const {userId} = req.params;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.notFound("User not found");
        }

        return res.success(user, "User fetched successfully");
    } catch (err) {
        next(err);
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const user = req.user;
        console.log(user);
        return res.success(user, "User profile fetched successfully");
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const userUpdatedData = req.body;
      const currentUser = req.user; // from auth middleware
  
      const existingUser = await User.findById(userId);
  
      if (!existingUser) {
        return res.notFound("User not found");
      }
  
      // Only admins can update role or verified status
      if (currentUser.role !== "admin") {
        delete userUpdatedData.role;
        delete userUpdatedData.verified;
      }
  
      // Handle organization
      if (userUpdatedData?.role === "event-manager") {
        const orgValue = userUpdatedData?.organization ?? existingUser.organization;
        if (!orgValue || !orgValue.toString().trim()) {
          return res.badRequest("Organization is required for event managers");
        }
      } else {
        // If user is not event-manager, set organization to empty string
        userUpdatedData.organization = "";
      }
  
      // Allowed fields for update
      const allowedFields = ["name", "email", "phone", "organization", "role", "verified"];
      const updates = {};
  
      allowedFields.forEach((field) => {
        if (userUpdatedData[field] !== undefined && userUpdatedData[field] !== null) {
          const value = typeof userUpdatedData[field] === "string" ? userUpdatedData[field].trim() : userUpdatedData[field];
          updates[field] = value;
        }
      });
  
      const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select("-password");
  
      return res.success(user, "User updated successfully");
    } catch (err) {
      next(err);
    }
  };
  
  

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const currentUser = req.user;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deleting your own account
        if (user._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: { userId: user._id }
        });

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: err.message
        });
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const userUpdatedData = req.body;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.notFound("User not found");
        }

        if (role === "event-manager") {
            const orgValue = userUpdatedData?.organization;
            if (!orgValue || !orgValue.toString().trim()) {
                return res.badRequest("Organization is required");
            }
        } else {
            delete userUpdatedData.organization;
        }

        const allowedFields = ["name", "email", "phone", "organization",];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                const value = req.body[field].toString().trim();
                if (value) {
                    updates[field] = value;
                }
            }
        });

        const user = await User.findByIdAndUpdate(userId, {$set: updates}, {new: true}).select("-password");

        if (!user) {
            return res.notFound("Failed to update user");
        }

        return res.success(user, "User updated successfully");
    } catch (err) {
        next(err);
    }
}
