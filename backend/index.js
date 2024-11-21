import express from 'express';
import connectDB from './config/db.config.js';

const app = express();

app.get('/', (req, res) => {
    res.send("Hellooo...");
});

app.listen(5000, () => {
    connectDB();
    console.log("Server running at port 3000");
});
