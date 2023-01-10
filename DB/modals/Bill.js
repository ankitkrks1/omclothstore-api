const mongoose = require('mongoose')

const billSchema = new mongoose.Schema({
    billNo:{
        type:String,
        trim:true,
        require:true,
        unique:true
    },
    billAmount:{
        type:Number,
        trim:true,
        require:true
    },
    createBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    image:{
        type:Buffer
    }
},{
    timestamps:true
})
//Stoping express to send image 
billSchema.methods.toJSON = function(){
    const bill = this
    const billObject = bill.toObject()

    delete billObject.image
    return billObject
}
const Bill = mongoose.model("Bill",billSchema)

module.exports = Bill