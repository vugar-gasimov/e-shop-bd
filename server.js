const express = require('express');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => res.send('My E-Shop Back-end'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port: ${port}`));
