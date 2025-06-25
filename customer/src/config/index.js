const dotEnv = require("dotenv")
const path = require("path")

// Load environment variables based on NODE_ENV
const loadEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || "development"

  // Try to load environment-specific file first
  if (nodeEnv !== "production") {
    const envFile = `.env.${nodeEnv}`
    const envPath = path.resolve(process.cwd(), envFile)

    try {
      dotEnv.config({ path: envPath })
      console.log(`Loaded environment from ${envFile}`)
    } catch (error) {
      console.log(`Could not load ${envFile}, falling back to .env`)
    }
  }

  // Load default .env file
  dotEnv.config()
}

// Load environment variables
loadEnvironment()

// Validate required environment variables
const requiredEnvVars = ["APP_SECRET", "MONGODB_URI", "MSG_QUEUE_URL", "EXCHANGE_NAME"]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars.join(", "))
  process.exit(1)
}

// Helper function to parse boolean environment variables
const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === "undefined") return defaultValue
  return value.toLowerCase() === "true"
}

// Helper function to parse integer environment variables
const parseInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Configuration object
const config = {
  // Application settings
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInteger(process.env.PORT, 8001),

  // Security settings
  APP_SECRET: process.env.APP_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  BCRYPT_SALT_ROUNDS: parseInteger(process.env.BCRYPT_SALT_ROUNDS, 12),

  // Database settings
  DB_URL: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME || "customer_service",
  DB_OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInteger(process.env.DB_MAX_POOL_SIZE, 10),
    serverSelectionTimeoutMS: parseInteger(process.env.DB_TIMEOUT, 5000),
    socketTimeoutMS: parseInteger(process.env.DB_SOCKET_TIMEOUT, 45000),
  },

  // Message Queue settings
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  QUEUE_OPTIONS: {
    durable: parseBoolean(process.env.QUEUE_DURABLE, true),
    exclusive: parseBoolean(process.env.QUEUE_EXCLUSIVE, false),
    autoDelete: parseBoolean(process.env.QUEUE_AUTO_DELETE, false),
  },

  // Service names
  CUSTOMER_SERVICE: process.env.CUSTOMER_SERVICE || "customer_service",
  SHOPPING_SERVICE: process.env.SHOPPING_SERVICE || "shopping_service",
  PRODUCT_SERVICE: process.env.PRODUCT_SERVICE || "product_service",

  // API settings
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  RATE_LIMIT_WINDOW_MS: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 100),

  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  CORS_CREDENTIALS: parseBoolean(process.env.CORS_CREDENTIALS, true),

  // Logging settings
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE: process.env.LOG_FILE || "app.log",
  LOG_MAX_SIZE: process.env.LOG_MAX_SIZE || "20m",
  LOG_MAX_FILES: parseInteger(process.env.LOG_MAX_FILES, 5),

  // Health check settings
  HEALTH_CHECK_PATH: process.env.HEALTH_CHECK_PATH || "/health",
  HEALTH_CHECK_TIMEOUT: parseInteger(process.env.HEALTH_CHECK_TIMEOUT, 5000),

  // Development settings
  isDevelopment: () => config.NODE_ENV === "development",
  isProduction: () => config.NODE_ENV === "production",
  isTest: () => config.NODE_ENV === "test",
}

// Validate configuration
const validateConfig = () => {
  const errors = []

  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push("PORT must be between 1 and 65535")
  }

  if (config.APP_SECRET.length < 32) {
    errors.push("APP_SECRET should be at least 32 characters long")
  }

  if (!config.DB_URL.startsWith("mongodb://") && !config.DB_URL.startsWith("mongodb+srv://")) {
    errors.push("MONGODB_URI must be a valid MongoDB connection string")
  }

  if (!config.MSG_QUEUE_URL.startsWith("amqp://") && !config.MSG_QUEUE_URL.startsWith("amqps://")) {
    errors.push("MSG_QUEUE_URL must be a valid AMQP connection string")
  }

  if (errors.length > 0) {
    console.error("Configuration validation errors:")
    errors.forEach((error) => console.error(`- ${error}`))
    process.exit(1)
  }
}

// Validate configuration in production
if (config.isProduction()) {
  validateConfig()
}

// Log configuration (excluding sensitive data)
if (config.isDevelopment()) {
  console.log("Configuration loaded:", {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    DB_NAME: config.DB_NAME,
    EXCHANGE_NAME: config.EXCHANGE_NAME,
    CUSTOMER_SERVICE: config.CUSTOMER_SERVICE,
    SHOPPING_SERVICE: config.SHOPPING_SERVICE,
    API_PREFIX: config.API_PREFIX,
    LOG_LEVEL: config.LOG_LEVEL,
  })
}

module.exports = config
