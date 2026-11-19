import express from "express";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const publicPath = path.resolve("public");
app.use(express.static(publicPath));
app.set("view engine", "ejs");

const dbName = "node-project";
const collectionName = "todo";
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};

app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.find().toArray();
  resp.render("list", { result });
});

app.get("/add", (req, resp) => {
  resp.render("add");
});

app.get("/update", (req, resp) => {
  resp.render("update");
});

app.post("/add", async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne({
    ...req.body,
    createdAt: new Date(),
  });
  if (result.acknowledged) {
    resp.redirect("/");
  } else {
    resp.redirect("/add");
  }
});
app.get("/delete/:id", async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  if (result.acknowledged) {
    resp.redirect("/");
  } else {
    resp.send("Some error");
  }
});

app.get("/update/:id", async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  if (!ObjectId.isValid(req.params.id)) {
    return resp.sendStatus(404);
  }

  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (!result) {
    return resp.sendStatus(404);
  }

  resp.render("update", { result });
});

app.post("/update/:id", async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  if (!ObjectId.isValid(req.params.id)) {
    return resp.sendStatus(404);
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { title: req.body.title, description: req.body.description } },
  );
  if (result.matchedCount === 0) {
    return resp.sendStatus(404);
  }

  resp.redirect("/");
});
app.listen(3200);
