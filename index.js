const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 4000;
let code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use('/code', code);
app.use('/pair',async (req, res, next) => {
res.sendFile(__path + '/pair.html')
})
app.use('/',async (req, res, next) => {
res.sendFile(__path + '/main.html')
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`Xason Xtarmd is running on running on http://localhost:` + PORT)
})

module.exports = app
