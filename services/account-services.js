var AccountModel = require("../models/account-model");

function updateUserLogin(idUser, isLogin){
    return AccountModel.AccountModel.updateOne({
        _id: idUser
    },{
        isLogin: isLogin
    })
}

module.exports = {
    updateUserLogin
}