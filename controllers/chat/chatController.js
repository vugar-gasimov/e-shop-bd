const { responseReturn } = require('../../utils/response');
const vendorModel = require('../../models/vendorModel');
const customerModel = require('../../models/customerModel');
const vendorCustomersModel = require('../../models/chat/vendorCustomersModel');
const vendorCustomerMessageModel = require('../../models/chat/vendorCustomerMessageModel');
const adminVendorMessage = require('../../models/chat/adminVendorMessage');

class chatController {
  add_friend = async (req, res) => {
    const { vendorId, userId } = req.body;

    // Validate input
    if (!vendorId || !userId) {
      responseReturn(res, 400, {
        error: 'vendorId and userId are required',
      });
    }

    try {
      if (vendorId !== '') {
        const vendor = await vendorModel.findById(vendorId);
        const user = await customerModel.findById(userId);

        if (!vendor || !user) {
          responseReturn(res, 404, {
            error: 'Vendor or user not found',
          });
        }

        const checkVendor = await vendorCustomersModel.findOne({
          myId: userId,
          friendsId: { $elemMatch: { fdId: vendorId } },
        });

        if (!checkVendor) {
          await vendorCustomersModel.updateOne(
            {
              myId: userId,
            },
            {
              $push: {
                friendsId: {
                  fdId: vendorId,
                  name: vendor.shopInfo?.shopName,
                  image: vendor.image,
                },
              },
            },
            { upsert: true }
          );
        }

        const checkCustomer = await vendorCustomersModel.findOne({
          myId: vendorId,
          friendsId: { $elemMatch: { fdId: userId } },
        });

        if (!checkCustomer) {
          await vendorCustomersModel.updateOne(
            {
              myId: vendorId,
            },
            {
              $push: {
                friendsId: {
                  fdId: userId,
                  name: user.name,
                  image: '',
                },
              },
            },
            { upsert: true }
          );
        }

        const messages = await vendorCustomerMessageModel.find({
          $or: [
            { receiverId: vendorId, senderId: userId },
            { receiverId: userId, senderId: vendorId },
          ],
        });
        const myFriends = await vendorCustomersModel.findOne({
          myId: userId,
        });
        const currentFd = myFriends?.friendsId?.find(
          (s) => s.fdId === vendorId
        );
        responseReturn(res, 201, {
          my_friends: myFriends?.friendsId,
          currentFd,
          messages,
          message: 'Friend added to chat successfully',
        });
      } else {
        const myFriends = await vendorCustomersModel.findOne({
          myId: userId,
        });
        responseReturn(res, 201, {
          my_friends: myFriends?.friendsId,
        });
      }
    } catch (error) {
      console.error(error.message);
    }
  }; // End of chat post add friend method

  send_message = async (req, res) => {
    const { userId, text, vendorId, name } = req.body;
    try {
      const newMessage = await vendorCustomerMessageModel.create({
        senderId: userId,
        senderName: name,
        receiverId: vendorId,
        message: text,
      });
      const userFriends = await vendorCustomersModel.findOne({ myId: userId });
      let userFriendList = userFriends.friendsId;
      let vendorIndex = userFriendList.findIndex((f) => f.fdId === vendorId);

      if (vendorIndex > -1) {
        const [vendorFriend] = userFriendList.splice(vendorIndex, 1);
        userFriendList.unshift(vendorFriend);
      }
      await vendorCustomersModel.updateOne(
        {
          myId: userId,
        },
        {
          friendsId: userFriendList,
        }
      );
      const vendorFriends = await vendorCustomersModel.findOne({
        myId: vendorId,
      });
      let vendorFriendList = vendorFriends.friendsId;
      let userIndex = vendorFriendList.findIndex((f) => f.fdId === userId);

      if (userIndex > -1) {
        const [userFriend] = vendorFriendList.splice(userIndex, 1);
        vendorFriendList.unshift(userFriend);
      }
      await vendorCustomersModel.updateOne(
        {
          myId: vendorId,
        },
        { friendsId: vendorFriendList }
      );
      responseReturn(res, 201, {
        newMessage,
        message: 'Friend added to chat successfully',
      });
    } catch (error) {
      console.error(error.message);
    }
  }; // End of sent message method

  get_customers = async (req, res) => {
    const { vendorId } = req.params;
    if (!vendorId) {
      return responseReturn(res, 400, {
        error: 'vendorId is required',
      });
    }
    try {
      const data = await vendorCustomersModel.findOne({
        myId: vendorId,
      });

      if (!data) {
        return responseReturn(res, 404, {
          message: 'No customers found for this vendor',
        });
      }
      responseReturn(res, 200, {
        customers: data.friendsId || [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get customers method

  get_customer_message = async (req, res) => {
    const { customerId } = req.params;
    const { id } = req;

    try {
      const messages = await vendorCustomerMessageModel.find({
        $or: [
          { receiverId: customerId, senderId: id },
          { receiverId: id, senderId: customerId },
        ],
      });
      const currentCustomer = await customerModel.findById(customerId);
      responseReturn(res, 200, {
        messages,
        currentCustomer,
        message: 'Customer message fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get customer message method

  send_message_customer = async (req, res) => {
    const { senderId, receiverId, text, name } = req.body;
    try {
      const newMessage = await vendorCustomerMessageModel.create({
        senderId: senderId,
        senderName: name,
        receiverId: receiverId,
        message: text,
      });
      const userFriends = await vendorCustomersModel.findOne({
        myId: senderId,
      });
      let userFriendList = userFriends.friendsId;
      let vendorIndex = userFriendList.findIndex((f) => f.fdId === receiverId);

      if (vendorIndex > -1) {
        const [vendorFriend] = userFriendList.splice(vendorIndex, 1);
        userFriendList.unshift(vendorFriend);
      }
      await vendorCustomersModel.updateOne(
        {
          myId: senderId,
        },
        {
          friendsId: userFriendList,
        }
      );
      const vendorFriends = await vendorCustomersModel.findOne({
        myId: receiverId,
      });
      let vendorFriendList = vendorFriends.friendsId;
      let userIndex = vendorFriendList.findIndex((f) => f.fdId === senderId);

      if (userIndex > -1) {
        const [userFriend] = vendorFriendList.splice(userIndex, 1);
        vendorFriendList.unshift(userFriend);
      }
      await vendorCustomersModel.updateOne(
        {
          myId: receiverId,
        },
        { friendsId: vendorFriendList }
      );
      responseReturn(res, 201, {
        newMessage,
        message: 'Vendor message posted successfully',
      });
    } catch (error) {
      console.error(error.message);
    }
  }; // End of post vendor message method

  get_vendors = async (req, res) => {
    try {
      const vendors = await vendorModel.find({});

      if (vendors.length === 0) {
        return responseReturn(res, 404, {
          message: 'No Vendors found.',
        });
      }
      responseReturn(res, 200, {
        vendors,
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get vendors method

  send_admin_message = async (req, res) => {
    const { senderId, receiverId, message, senderName } = req.body;
    if (!message || !senderName) {
      return responseReturn(res, 400, {
        error: 'All fields (  message, senderName ) are required.',
      });
    }
    try {
      const adminMessage = await adminVendorMessage.create({
        senderId,
        receiverId,
        message,
        senderName,
      });
      responseReturn(res, 200, {
        message: 'Message sent successfully!',
        data: adminMessage,
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of send admin message method

  get_admin_messages = async (req, res) => {
    const { receiverId } = req.params;

    const id = '';

    try {
      const messages = await adminVendorMessage.find({
        $or: [
          { receiverId: receiverId, senderId: id },
          { receiverId: id, senderId: receiverId },
        ],
      });
      let currentVendor = {};
      if (receiverId) {
        const currentVendor = await vendorModel.findById(receiverId);
      }
      responseReturn(res, 200, {
        messages,
        currentVendor,
        message: 'Admin messages fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get admin messages method

  get_vendor_messages = async (req, res) => {
    const receiverId = '';

    const { id } = req;

    try {
      const messages = await adminVendorMessage.find({
        $or: [
          { receiverId: receiverId, senderId: id },
          { receiverId: id, senderId: receiverId },
        ],
      });

      responseReturn(res, 200, {
        messages,

        message: 'Admin messages fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get vendor messages method
}

module.exports = new chatController();
