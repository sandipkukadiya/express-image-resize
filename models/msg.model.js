const mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost:27017/truechat',{ useNewUrlParser: true });
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

const MsgsSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  }
},{ versionKey: false });

MsgsSchema.plugin(autoIncrement.plugin, 'Msg');
module.exports = connection.model('Msg', MsgsSchema);