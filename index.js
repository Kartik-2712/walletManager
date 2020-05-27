const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
app.use(cors())

app.use(bodyParser.json());
require('./routes/walletRoutes')(app);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});