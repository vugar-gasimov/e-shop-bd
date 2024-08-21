const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { dbConnect } = require('./utils/db');
require('dotenv').config();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));

app.get('/', (req, res) => res.send('My E-Shop Back-end'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

const port = process.env.PORT || 5000;

dbConnect().catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
