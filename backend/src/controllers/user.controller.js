import User from "../models/user.model.js";

export const verifyUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        let user = await User.findById(userId).select("-password");

        if (!user) {
            return res.notFound("User not found");
        }

        if (user.role !== "event-manager") {
            return res.notFound("User is not an organizer");
        }

        if (user.verified) {
            return res.success(user, "User is already verified");
        }

        user.verified = true;
        await user.save();

        res.success(user, "User verified successfully");
    } catch (err) {
        next(err);
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

        if (verified !== undefined) queryFilter.verified = verified === "true";
        if (organization)
            queryFilter.organization = {$regex: new RegExp(organization, "i")};
        if (role) {
            // Handle both single role and comma-separated roles
            const roles = Array.isArray(role) ? role : role.split(',');
            if (roles.length > 1) {
                queryFilter.role = { $in: roles };
            } else if (roles.length === 1) {
                queryFilter.role = roles[0];
            }
        }

        if (search) {
            queryFilter.$or = [
                {name: {$regex: search, $options: "i"}},
                {email: {$regex: search, $options: "i"}},
                {phone: {$regex: search, $options: "i"}},
                {organization: {$regex: search, $options: "i"}},
            ];
        }

        const pageNum = parseInt(page);
        const pageLimit = parseInt(limit);
        const skip = (pageNum - 1) * limit;

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
        const {userId} = req.params;
        const userUpdatedData = req.body;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.notFound("User not found");
        }

        if (existingUser?.role === "event-manager") {
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

        return res.success(user, "User updated successfully");
    } catch (err) {
        next(err);
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
