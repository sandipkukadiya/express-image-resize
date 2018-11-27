const mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost:27017/truechat',{ useNewUrlParser: true });
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

const UsersSchema = new mongoose.Schema({
  contry_code:{
    type: Number,
    required: true
  },  
  mobile: {
    type: String,
    required: true,
  },
  full_mobile:{
    type: String,
    required: true,
    unique: true
  },
  username:{
    type: String,
    required:true
  },
  profile:{
    type: String
  },
  about:{
    type: String
  },
  date:{
    type: Date,
    default: Date.now
  }
},{ versionKey: false });

UsersSchema.plugin(autoIncrement.plugin, 'Users');
module.exports = connection.model('Users', UsersSchema);