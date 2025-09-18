import Event from "../models/event.model.js";
import cloudinary from "../config/cloudinary.js";

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, tickets, date, category, subcategory } =
      req.body;

    let imageUrl = null;
    let imagePublicId = null;

    if (!req.file) {
      return res.error("Please upload an image", 400);
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "events" },
        (err, result) => {
          if (err) {
            console.error("Error uploading image to Cloudinary:", err);
            next(err);
            reject(err);
            throw err;
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;

    const event = await Event.create({
      title,
      description,
      imageUrl: imageUrl,
      imageId: imagePublicId,
      tickets: JSON.parse(tickets),
      date: new Date(date),
      category,
      subcategory,

      createdBy: req.user._id,
      status: "pending",
    });

    const eventData = event._doc;

    res.created(
      eventData,
      "Event created successfully, pending admin verification"
    );
  } catch (err) {
    next(err);
  }
};

export const verifyEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { verified: true },
      { new: true }
    );

    if (!event) {
      return res.notFound("Event not found");
    }

    res.success(event, "Event verified successfully");
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const {
      verified,
      createdBy,
      category,
      page = 1,
      limit = 2,
      order,
      sortBy,
      search,
      status,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      type,
      ...filters
    } = req.query;

    const userId = req.user?._id;
    const role = req.user?.role;

    const queryFilter = {};

    if (verified !== undefined) queryFilter.verified = verified === "true";
    if (category) queryFilter.category = { $regex: new RegExp(category, "i") };

    if (startDate || endDate) {
      const dateConditions = [];

      if (startDate) {
        const parsedStart = new Date(startDate);
        if (!isNaN(parsedStart)) {
          // Event starts on or after the query start date
          dateConditions.push({ startDate: { $gte: parsedStart } });
        }
      }

      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (!isNaN(parsedEnd)) {
          parsedEnd.setHours(23, 59, 59, 999);
          // Event ends on or before the query end date
          dateConditions.push({ endDate: { $lte: parsedEnd } });
        }
      }

      if (dateConditions.length > 0) {
        queryFilter.$and = queryFilter.$and || [];
        queryFilter.$and.push(...dateConditions);
      }
    }

    const ticketFilters = {};

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) {
        const priceMin = Number(minPrice);
        if (!isNaN(minPrice)) {
          priceFilter.$gte = priceMin;
        }
      }

      if (maxPrice) {
        const priceMax = Number(maxPrice);
        if (!isNaN(maxPrice)) {
          priceFilter.$lte = priceMax;
        }
      }

      if (Object.keys(priceFilter).length > 0) {
        ticketFilters.price = priceFilter;
      }
    }

    if (type) {
      ticketFilters.type = { $regex: new RegExp(type, "i") };
    }

    if (Object.keys(ticketFilters).length > 0) {
      queryFilter.tickets = {
        $elemMatch: ticketFilters,
      };
    }

    Object.assign(queryFilter, filters);

    if (role === "admin") {
      if (status) {
        queryFilter.status = Array.isArray(status) ? { $in: status } : status;
      }
    } else if (role === "event-manager") {
      const allowedStatus = ["pending", "active"];
      const ownEventsFilter = { createdBy: userId };

      const otherEventsFilter = {
        createdBy: { $ne: userId },
        verified: true,
        status: { $in: allowedStatus },
      };

      if (status) {
        ownEventsFilter.status = Array.isArray(status)
          ? { $in: status }
          : status;

        otherEventsFilter.status = Array.isArray(status)
          ? { $in: status.filter((s) => allowedStatus.includes(s)) }
          : status;
      }

      queryFilter.$or = [ownEventsFilter, otherEventsFilter];
    } else {
      queryFilter.verified = true;

      if (status) {
        const allowedStatus = ["pending", "active"];

        if (Array.isArray(status)) {
          queryFilter.status = {
            $in: status.filter((s) => allowedStatus.includes(s)),
          };
        } else {
          queryFilter.status = allowedStatus.includes(status)
            ? status
            : {
                $in: ["pending", "active"],
              };
        }
      } else {
        queryFilter.status = { $in: ["pending", "active"] };
      }
    }

    const pageNum = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNum - 1) * limit;

    let sortOptions = {};
    const sortOrder = order === "asc" ? 1 : -1;

    switch (sortBy) {
      case "updatedAt":
        sortOptions = { updatedAt: sortOrder, createdAt: -1 };
        break;
      case "price":
        sortOptions = { "tickets.price": sortOrder, createdAt: -1 };
        break;
      case "title":
        sortOptions = { title: sortOrder, createdAt: -1 };
        break;
      case "createdAt":
        sortOptions = { createdAt: sortOrder };
        break;
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const pipeline = [
      { $match: queryFilter },
      {
        $lookup: {
          from: "users",
          let: { userId: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { _id: 1, name: 1, organization: 1 } },
          ],
          as: "createdBy",
        },
      },
      { $unwind: "$createdBy" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { subcategory: { $regex: search, $options: "i" } },
            { "createdBy.name": { $regex: search, $options: "i" } },
            { "createdBy.organization": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (createdBy) {
      pipeline.push({
        $match: {
          $or: [
            { "createdBy.name": { $regex: new RegExp(createdBy, "i") } },
            {
              "createdBy.organization": { $regex: new RegExp(createdBy, "i") },
            },
          ],
        },
      });
    }

    const totalEventsAgg = await Event.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);

    const totalEvents = totalEventsAgg[0]?.total || 0;

    pipeline.push({ $sort: sortOptions });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: pageLimit });

    const events = await Event.aggregate(pipeline);

    // Return empty array instead of 404 for better frontend handling
    if (!events.length) {
      return res.success(
        {
          events: [],
          filters: {
            verified,
            createdBy,
            category,
            search,
            ...filters,
          },
          pagination: {
            total: 0,
            page: pageNum,
            limit: pageLimit,
            totalPages: 0,
          },
        },
        "No events found"
      );
    }

    res.success(
      {
        events,
        filters: {
          verified,
          createdBy,
          category,
          search,
          ...filters,
        },
        pagination: {
          total: totalEvents,
          page: pageNum,
          limit: pageLimit,
          totalPages: Math.ceil(totalEvents / pageLimit),
        },
      },
      "Event fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, tickets, date, category, subcategory } =
      req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.notFound("Event not found");
    }

    const userRole = req.user.role;
    const isCreator =
      event.createdBy._id.toString() === req.user._id.toString();

    if (
      userRole === "customer" ||
      (userRole === "event-manager" && !isCreator)
    ) {
      return res.forbidden("You are not authorized to update this event");
    }

    if (req.file) {
      if (event.imageId) {
        await cloudinary.uploader.destroy(event.imageId);
      }

      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (err, result) => {
            if (err) {
              console.error("Error uploading image to Cloudinary:", err);
              next(err);
              reject(err);
              throw err;
            }
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      event.imageUrl = uploadResult.secure_url;
      event.imageId = uploadResult.public_id;
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (tickets) event.tickets = tickets;
    if (date) event.date = date;
    if (category) event.category = category;
    if (subcategory) event.subcategory = subcategory;

    const updateEvent = await event.save();

    res.success(updateEvent, "Event updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.notFound("Event not found");
    }

    const userRole = req.user.role;
    const isCreator = event.createdBy.toString() === req.user._id.toString();

    if (
      userRole === "customer" ||
      (userRole === "event-manager" && !isCreator)
    ) {
      return res.forbidden("You are not authorized to delete this event");
    }

    if (event.verified) {
      const hasSoldTickets = event.tickets.some((t) => t.sold > 0);

      if (hasSoldTickets) {
        return res.forbidden("Cannot delete event with sold tickets");
      }
    }

    if (event.imageId) {
      await cloudinary.uploader.destroy(event.imageId);
    }

    await Event.findByIdAndDelete(eventId);

    res.success({}, "Event deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const singleEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate(
      "createdBy",
      "name email phone"
    );

    if (!event) {
      return res.notFound("Event not found");
    }

    res.success(event, "Event fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getOwnedEvent = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const {
      search,
      verified,
      category,
      page = 1,
      limit = 2,
      order,
      sortBy,
      ...filters
    } = req.query;

    const queryFilter = {};

    if (verified !== undefined) queryFilter.verified = verified === "true";
    if (category) queryFilter.category = { $regex: new RegExp(category, "i") };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      queryFilter.date = {};
      if (filters.startDate)
        queryFilter.date.$gte = new Date(filters.startDate);
      if (filters.endDate) queryFilter.date.$lte = new Date(filters.endDate);
      delete filters.startDate;
      delete filters.endDate;
    }

    if (filters.minPrice || filters.maxPrice) {
      queryFilter["tickets.price"] = {};
      if (filters.minPrice)
        queryFilter["tickets.price"].$gte = Number(filters.minPrice);
      if (filters.maxPrice)
        queryFilter["tickets.price"].$lte = Number(filters.maxPrice);
      delete filters.minPrice;
      delete filters.maxPrice;
    }

    Object.assign(queryFilter, filters);

    queryFilter.createdBy = ownerId;

    const pageNum = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (page - 1) * limit;

    let sortOptions = {};
    const sortOrder = order === "asc" ? 1 : -1;

    if (sortBy) {
      switch (sortBy) {
        case "updatedAt":
          sortOptions = { updatedAt: sortOrder };
          break;
        case "price":
          sortOptions = { "tickets.price": sortOrder };
          break;
        default:
          sortOptions = { createdAt: sortOrder };
      }
    } else {
      if (order) {
        sortOptions = { title: sortOrder, createdAt: sortOrder };
      } else {
        sortOptions = { createdAt: -1 };
      }
    }

    const events = await Event.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    const totalEvents = await Event.countDocuments(queryFilter);

    res.success(
      {
        events,
        filters: {
          verified,
          category,
          search,
          ...filters,
        },
        pagination: {
          total: totalEvents,
          page: pageNum,
          limit: pageLimit,
          pages: Math.ceil(totalEvents / pageLimit),
        },
      },
      "Event fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};
