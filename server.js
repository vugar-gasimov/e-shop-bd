const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { dbConnect } = require('./utils/db');

const socket = require('socket.io');
const http = require('http');
const server = http.createServer(app);
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

let allCustomers = [];
let allVendors = [];
let admin = {};

const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomers.some((u) => u.customerId === customerId);
  if (!checkUser) {
    allCustomers.push({
      customerId,
      socketId,
      userInfo,
    });
  }
};

const addVendor = (vendorId, socketId, userInfo) => {
  const checkVendor = allVendors.some((u) => u.vendorId === vendorId);
  if (!checkVendor) {
    allVendors.push({
      vendorId,
      socketId,
      userInfo,
    });
  }
};

const findCustomer = (customerId) => {
  return allCustomers.find((c) => c.customerId === customerId);
};
const findVendor = (vendorId) => {
  return allVendors.find((c) => c.vendorId === vendorId);
};

const remove = (socketId) => {
  allCustomers = allCustomers.filter((c) => c.socketId !== socketId);
  allVendors = allVendors.filter((c) => c.socketId !== socketId);
};

io.on('connection', (soc) => {
  console.log('Socket server running...');

  soc.on('add_user', (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    io.emit('activeVendor', allVendors);
  });

  soc.on('add_vendor', (vendorId, userInfo) => {
    addVendor(vendorId, soc.id, userInfo);
    io.emit('activeVendor', allVendors);
  });

  soc.on('send_vendor_message', (msg) => {
    if (!msg || !msg.receiverId) {
      console.error('Invalid message or missing receiverId', msg);
      return;
    }
    const customer = findCustomer(msg.receiverId);
    if (customer !== undefined) {
      soc.to(customer.socketId).emit('vendor_message', msg);
    }
  });

  soc.on('send_customer_message', (msg) => {
    if (!msg || !msg.receiverId) {
      console.error('Invalid message or missing receiverId', msg);
      return;
    }
    const vendor = findVendor(msg.receiverId);
    if (vendor !== undefined) {
      soc.to(vendor.socketId).emit('customer_message', msg);
    }
  });
  soc.on('send_message_admin_vendor', (msg) => {
    if (!msg || !msg.receiverId) {
      console.error('Invalid message or missing receiverId', msg);
      return;
    }
    const vendor = findVendor(msg.receiverId);
    if (vendor !== undefined) {
      soc.to(vendor.socketId).emit('received_admin_message', msg);
    }
  });

  soc.on('send_message_vendor_admin', (msg) => {
    // if (!msg || !msg.receiverId) {
    //   console.error('Invalid message or missing receiverId', msg);
    //   return;
    // }
    if (admin.socketId) {
      soc.to(admin.socketId).emit('received_vendor_message', msg);
    }
  });

  soc.on('add_admin', (adminInfo) => {
    if (!adminInfo || typeof adminInfo !== 'object') {
      console.error('Invalid adminInfo received:', adminInfo);
      return;
    }
    delete adminInfo.email;
    delete adminInfo.password;
    admin = adminInfo;
    admin.socketId = soc.id;
    io.emit('activeVendor', allVendors);
  });

  soc.on('disconnect', () => {
    console.log('user disconnected');
    remove(soc.id);
    io.emit('activeVendor', allVendors);
  });
});

require('dotenv').config();

app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/chatRoutes'));
app.use('/api', require('./routes/home/cartRoutes'));
app.use('/api', require('./routes/order/orderRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
app.use('/api', require('./routes/dashboard/vendorRoutes'));
app.use('/api', require('./routes/home/customerAuthRoutes'));

app.get('/', (req, res) => res.send('My E-Shop Back-end'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'An unexpected error occurred' });
});

const port = process.env.PORT || 5000;

dbConnect().catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

server.listen(port, () => console.log(`Server is running on port: ${port}`));
