const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

const redisClient = Redis.createClient();
redisClient.connect();
redisClient.on("error", (err) => console.log("Redis Client Error", err));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const DEFAULT_EXPIRATION = 3600;

app.get("/", (req, res) =>
  res.send("Hello try /photos?albumId= or /photos/:id!")
);
app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;

  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    return data;
  });

  res.json(photos);
});

app.get("/photos/:id", async (req, res) => {
  const id = req.params.id;

  const photo = await getOrSetCache(`photos:${id}`, async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${id}`,
    );
    return data;
  });

  res.json(photo);
});

const port = 3000;
app.listen(port, console.log(`Running on port: ${port}`));

function getOrSetCache(key, callback) {
  return new Promise(async (resolve, reject) => {
    const data = await redisClient.get(key);

    if (data !== null) {
      return resolve(JSON.parse(data));
    } else {
      const freshData = await callback();
      redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    }
  });
}
