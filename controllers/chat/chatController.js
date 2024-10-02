const { responseReturn } = require('../../utils/response');
const vendorModel = require('../../models/vendorModel');
const customerModel = require('../../models/customerModel');
const vendorCustomersModel = require('../../models/chat/vendorCustomersModel');

class chatController {
  add_friend = async (req, res) => {
    const { vendorId, userId } = req.body;
    try {
      if (vendorId !== '') {
        const vendor = await vendorModel.findById(vendorId);
        const user = await customerModel.findById(userId);
        const checkVendor = await vendorCustomersModel.findOne({
          $and: [
            {
              myId: {
                $eq: userId,
              },
            },
            {
              friendsId: {
                $elemMatch: {
                  fdId: vendorId,
                },
              },
            },
          ],
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
            }
          );
        }
        // ++++++++++++++++
        const checkCustomer = await vendorCustomersModel.findOne({
          $and: [
            {
              myId: {
                $eq: vendorId,
              },
            },
            {
              friendsId: {
                $elemMatch: {
                  fdId: userId,
                },
              },
            },
          ],
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
            }
          );
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }; // End of chat post add friend method
}

module.exports = new chatController();
