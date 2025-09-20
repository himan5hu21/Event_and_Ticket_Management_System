import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get pending verifications (unverified event managers)
    const pendingVerifications = await User.countDocuments({
      role: 'event-manager',
      verified: false
    });

    // Get today's events (events that have today's date within their start and end date range)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventsToday = await Event.countDocuments({
      startDate: { $lt: tomorrow },
      endDate: { $gte: today },
      status: { $ne: 'cancelled' }
    });

    // Get total pending events
    const pendingEvents = await Event.countDocuments({ status: 'pending' });

    // Get today's successful orders
    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'success' // Only count successful orders
    });

    // Calculate total revenue from successful orders
    const revenueResult = await Order.aggregate([
      {
        $match: { 
          status: 'success', // Only include successful orders
          amount: { $exists: true, $gt: 0 } // Ensure amount exists and is greater than 0
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' } // Changed from totalAmount to amount to match the model
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.success({
      stats: {
        pendingVerifications,
        eventsToday,
        pendingEvents,
        todayOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    next(error);
  }
};
