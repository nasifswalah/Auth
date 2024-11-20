import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send("Hellooo...");
});

app.listen(5000, () => {
    console.log("Server running at port 3000");
});