const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    pName:{
        type:String,
        trim:true,
        required:true
            },
    pQuantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    createdBy :{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    image:{
        type:Buffer
    }
    
},{
    timestamps: true
})
//Stoping express to send image 
productSchema.methods.toJSON = function(){
    const product = this
    const prodObject = product.toObject()

    delete prodObject.image
    return prodObject
}
const Product = mongoose.model('Product',productSchema)

module.exports = Product