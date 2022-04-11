const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userShcema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
//Virtual Property in schema 
userShcema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'createdBy'
})
userShcema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};
//Hash plain test password before saving to db
userShcema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Finding user when login
userShcema.statics.findUser = async (name, password) => {
  const user = await User.findOne({ name });
  if (!user) {
    throw {error:"Unable to login"};
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw {error :"Unable to Login -p"};
  }
  return user;
};

//stoping to send some data 
userShcema.methods.toJSON = function (){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  return userObject
}
const User = mongoose.model("User", userShcema);

module.exports = User;
