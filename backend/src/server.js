import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import initCronJobs from "./services/crons.js";

connectDB()
  .then(() => {
    console.log("✅ Database connected");

    initCronJobs();

    const PORT = env.PORT;

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    server.on("listening", () => {
      console.log("✅ Server is running successfully");
    });

    server.on("error", (err) => {
      console.error(`❌ Failed to start server: ${err.message}`);
    });

    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down server gracefully...");
      server.close(() => {
        console.log("✅ Server is closed");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  });
