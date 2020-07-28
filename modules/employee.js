var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://employeedb:employee12@cluster0-oixlo.mongodb.net/employee?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true});
var conn = mongoose.connection;
const employeeSchema = new mongoose.Schema({ 
        name: String,
        email: String,
        etype: String,
        hourlyRate: Number,
        totalHour: Number,
        total: Number,
        image: String,
});
var employeeModel = mongoose.model('Employee', employeeSchema);
module.exports = employeeModel;