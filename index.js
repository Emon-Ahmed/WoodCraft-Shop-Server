const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uana9.mongodb.net/DhakaTravelAgencyDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("woodcraft_shop");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
    app.post("/orders", async (req, res) => {
      const product = req.body;
      const result = await ordersCollection.insertOne(product);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = await ordersCollection.deleteOne({ _id: ObjectId(id) });
      res.json(cursor);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = await productsCollection.deleteOne({ _id: ObjectId(id) });
      res.json(cursor);
    });

    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = ordersCollection.find({ deliveryEmail: email });
      const products = await cursor.toArray();
      res.json(products);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.json(products);
    });

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = productsCollection.find({ _id: ObjectId(id) });
      const products = await cursor.toArray();
      res.json(products);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    console.log("Connected");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
