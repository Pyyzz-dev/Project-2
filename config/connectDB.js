const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://project-2:duongphongpasshet110999@cluster0.yg4dc.gcp.mongodb.net/project-2-NDP', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Kết nối thành công");
});

module.exports = mongoose;