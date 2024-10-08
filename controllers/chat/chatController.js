const { responseReturn } = require('../../utils/response');
const vendorModel = require('../../models/vendorModel');
const customerModel = require('../../models/customerModel');
const vendorCustomersModel = require('../../models/chat/vendorCustomersModel');
const vendorCustomerMessageModel = require('../../models/chat/vendorCustomerMessageModel');

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
}

module.exports = new chatController();
