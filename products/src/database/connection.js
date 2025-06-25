const mongoose = require("mongoose");
const { DB_URL } = require("../config");

const connectWithRetry = () => {
    mongoose.connect(DB_URL).catch(() => {})
}

module.exports = async () => {
    mongoose.connection.on("connected", () => {
        console.log("MonogDB connected");
    })

    mongoose.connection.on("error", (err) => {
        console.log("MongoDB connection error: ", err);
        setTimeout(connectWithRetry, 5000);
    })

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Reconnecting...");
        connectWithRetry()
    })

    process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("MongoDB connection close due to application terminaton");
        process.exit(0);

    })

    connectWithRetry();
}
