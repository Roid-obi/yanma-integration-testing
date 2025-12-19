require('dotenv').config()

const express = require('express');
const app = express();
const apiRoute = require('./src/routes/api');
const connectDB = require('./src/db/db');

const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRoute);

app.listen(port, () => {
    console.log(`Express Connected: http://localhost:${port}`);
})
