const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { CreateChannel } = require('./utils')

const StartServer = async() => {

    const app = express();

    await databaseConnection();

    const channel = await CreateChannel()

    await expressApp(app, channel);


   try {

    const server = app.listen(PORT, () => {
        console.log(`Customer service is runnin on port: ${PORT}`);
    })

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${PORT} is already in use.`);
        } else if(err.code === "EACCES"){
            console.error(`Insufficient privileges to bind to port ${PORT}`);
        } else {
            console.error("Failed to start server: ", err);
        }
        process.exit(1);
    })

    process.on("uncaughtException", (err)=> {
        console.error("Uncaught Excepion: ", err);
        server.close(() => process.exit(1))
    })

    process.on("unhandledRejection", (reason, promise) => {
        console.error("Undandled Rejection at: ", promise, "reason: ", reason);
        server.close(() => process.exit(1))
    })

   } catch (error) {
    console.error("Error during server startup: ", error);
    process.exit(1);
   }


}

StartServer();
