const mongoose = require("mongoose")
const config = require("../config")

module.exports = async () => {
  try {
    // Set mongoose options
    mongoose.set("strictQuery", false)

    // Connect to MongoDB with configuration options
    await mongoose.connect(config.DB_URL, config.DB_OPTIONS)

    console.log(`✅ Database connected successfully to ${config.DB_NAME}`)
    console.log(`📊 Connection state: ${mongoose.connection.readyState}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ Database connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  Database disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Database reconnected")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close()
        console.log("📴 Database connection closed through app termination")
        process.exit(0)
      } catch (err) {
        console.error("❌ Error during database shutdown:", err)
        process.exit(1)
      }
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)

    if (config.isProduction()) {
      console.error("🚨 Exiting application due to database connection failure")
      process.exit(1)
    } else {
      console.warn("⚠️  Continuing in development mode without database")
    }
  }
}
