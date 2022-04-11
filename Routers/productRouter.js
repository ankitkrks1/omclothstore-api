const express = require("express");
const Product = require("../DB/modals/Product");
const Router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
//Create a Product:- only by Admin so login required
Router.post("/product", auth, async (req, res) => {
  try {
    if (req.user.admin) {
      const product = new Product({ ...req.body, createdBy: req.user._id });
      await product.save();
      res.status(201).send(product);
    } else {
      res.status(401).send("User Need Admin acces to add Product!");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//Read Products:- Public can read products
Router.get("/products", async (req, res) => {
  const sort = {};
  const search = {};
  if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1]==='desc'?-1:1
  }
  if(req.query.search){
     const parts = req.query.search.split(':')
     
     const reg = new RegExp(parts[1],'i') // this will any match
     search[parts[0]]={$regex:reg}
   
  }
  const skip = req.query.skip ? req.query.skip :0

  const products = await Product.find(search).sort(sort).limit(3).skip(skip);
  if (!products) {
    res.status(404).send("No Product Found");
  }
  res.status(200).send(products);
});
// Read Product - by Id
Router.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).send("No Product Found");
  } else res.status(200).send(product);
});

// Delete Product only Perfromed by admin

Router.delete("/product/:id", auth, async (req, res) => {
  try {
    if (req.user.admin) {
      const product = await Product.deleteOne({ _id: req.params.id });
      if (!product) {
        res.status(404).send("Not Found or Not able to delete");
      }
      res.status(200).send(product);
    } else {
      res.status(401).send("Need Admin Access To Delete");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//Product Images upload- admin only
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});
Router.post(
  "/product/upload/image/:id",
  auth,
  upload.single("prodImg"),
  async (req, res) => {
    try {
      if (req.user.admin) {
        const product = await Product.findById(req.params.id);
        const buffer = await sharp(req.file.buffer)
          .resize({ width: 282, height: 361 })
          .jpeg()
          .toBuffer();
        product.image = buffer;
        //Saving img without chaning
        // product.image = req.file.buffer
        await product.save();
        res.status(200).send("Image uploaded successfully");
      } else {
        res.status(401).send("Admin access Required to upload Product Image");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

//Load Product Image
Router.get("/product/:id/prodImg", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpeg");
    res.send(product.image);
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = Router;
