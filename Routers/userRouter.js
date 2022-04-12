const express = require("express");
const Product = require("../DB/modals/Product");
const User = require("../DB/modals/User");
const auth = require("../middleware/auth");
const userRouter = new express.Router();

// Create user or Sign Up
userRouter.post("/user/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
//login
userRouter.post("/user/login", async (req, res) => {
  try {
    const user = await User.findUser(req.body.name, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// logout
userRouter.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.status(200).send("Logout Successfully");
  } catch (e) {
    res.status(500).send(e);
  }
});
//Show all Products created by Perticular User
userRouter.post("/user/products", auth,async (req, res) => {
  const sort = {};
  const search = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  if (req.query.search) {
    const parts = req.query.search.split(":");

    const reg = new RegExp(parts[1], "i"); // this will any match
    search[parts[0]] = { $regex: reg };
  }
  try {
    // await req.user.populate('products')
    // res.status(200).send(req.user.products)
    const products = await Product.find({...search,createdBy: req.user._id }).sort(sort);
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = userRouter;
