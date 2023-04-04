const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get('/', (req, res) => res.send('Hello try /photos?albumId or /photos/:id!'));
app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos",
    { params: { albumId } }
  );
  res.json(data);
});

app.get("/photos/:id", async (req, res) => {
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );
  res.json(data);
});

const port = 3000
app.listen(port, console.log(`Running on port: ${port}`));
