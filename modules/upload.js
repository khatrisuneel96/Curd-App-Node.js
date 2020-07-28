var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://employeedb:employee12@cluster0-oixlo.mongodb.net/employee?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true});

var conn = mongoose.Collection;

var uploadSchema = new mongoose.Schema({
    imagename: String,
});

var uploadModel = mongoose.model('uploadimage', uploadSchema);
module.exports = uploadModel;