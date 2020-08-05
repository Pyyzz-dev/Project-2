var mongoose = require("../config/connectDB");
const { model } = require("../config/connectDB");
var Schema = mongoose.Schema;
var accountSchema = new Schema({
    username: String,
    password: String,
    role: Number,
    class: String,
    isLogin:{
        type: Boolean,
        default: false,
    },
    idBook:[{
        type: String,
        ref:"book"
    }]
})

var AccountModel = mongoose.model("account", accountSchema);

var bookSchema = mongoose.Schema({
    name: String,
    author: String
})

var BookModel = mongoose.model("book", bookSchema);

module.exports = {
    AccountModel,
    BookModel
};