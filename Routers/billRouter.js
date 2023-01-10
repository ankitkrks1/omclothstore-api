const express = require("express");
const Bill = require("../DB/modals/Bill");
const billRouter = new express.Router();
const auth = require("../middleware/auth");
const multer = require('multer')
const sharp = require('sharp')
//Add a new Bill only when user logged in as admin
billRouter.post("/bill/add", auth, async (req, res) => {
  
  try {
    if (req.user.admin) {
      const bill = new Bill({ ...req.body, createBy: req.user._id });
      await bill.save();
      res.status(201).send(bill);
    } else {
      res.status(401).send("Required Amin Acces to Add bills");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//Read Bills only as adim
billRouter.get("/bills", auth, async (req, res) => {
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
  if (req.user.admin) {
    const bill = await Bill.find(search).sort(sort);
    if (!bill) {
      res.status(404).send("No Bill Found");
    }
    res.status(200).send(bill);
  }else{
      res.status(401).send('Required Admin access to read')
  }
});
// Read Bill - by Id
billRouter.get("/bill/:id", auth,async (req, res) => {
  if(req.user.admin){
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404).send("No Bill Found");
    } else res.status(200).send(bill);
  }else{
      res.status(401).send('Admin access required')
  }
});

// Delete Bill only Perfromed by admin

billRouter.delete("/bill/:id", auth, async (req, res) => {
  try {
    if(req.user.admin){
        const bill = await Bill.deleteOne({ _id: req.params.id });
    if (!bill) {
      res.status(404).send("Not Found or Not able to delete");
    }
    res.status(200).send(bill);
    }else{
        res.status(401).send('Admin Access required')
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//Bill image upload -Admin only
const upload = multer({
  fileFilter(req,file,cb){
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  }
})
billRouter.post('/bill/upload/image/:id',auth,upload.single('billImg'),async (req,res)=>{
  try {
    if (req.user.admin) {
      const bill = await Bill.findById(req.params.id);
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 1024, height: 1024 })
        .jpeg()
        .toBuffer();
      bill.image = buffer;
      //Saving img without chaning
      // bill.image = req.file.buffer
      await bill.save();
      res.status(200).send("Image uploaded successfully");
    } else {
      res.status(401).send("Admin access Required to upload Bill Image");
    }
  } catch (e) {
    res.status(500).send(e);
  }
})

//Load Product Image
billRouter.get("/bill/:id/billImg",async (req, res) => {
  try {
    
    const bill = await Bill.findById(req.params.id);
    if (!bill || !bill.image) {
      throw 'bill id or bill image not found!'
    }
    res.set("Content-Type", "image/jpeg");
    res.send(bill.image);
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = billRouter;
