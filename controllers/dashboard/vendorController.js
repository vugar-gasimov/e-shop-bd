const { responseReturn } = require('../../utils/response');
const vendorModel = require('../../models/vendorModel');

class vendorController {
  getVendor = async (req, res) => {
    const { vendorId } = req.params;
    if (!vendorId) {
      responseReturn(res, 400, { error: 'Vendor ID is required.' });
    }
    try {
      const vendor = await vendorModel.findById(vendorId);
      if (!vendor) {
        responseReturn(res, 404, { error: 'Vendor not found.' });
      }
      responseReturn(res, 200, {
        vendor,
        message: 'Vendor retrieved successfully.',
      });
    } catch (error) {
      console.error('Error fetching vendor:', error);
      responseReturn(res, 500, {
        error: 'Internal server error. Please try again later.',
      });
    }
  }; // End of get vendor method

  getVendors = async (req, res) => {
    const { page, searchValue, perPage } = req.query;

    const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
        const searchRegex = new RegExp(searchValue, 'i');
        const vendors = await vendorModel
          .find({ status: 'pending', name: searchRegex })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalVendors = await vendorModel
          .find({ status: 'pending', name: searchRegex })
          .countDocuments();
        responseReturn(res, 200, {
          vendors,
          totalVendors,
          totalPages: Math.ceil(totalVendors / perPage),
          currentPage: parseInt(page),
          perPage: parseInt(perPage),
          message: 'Vendors retrieved successfully.',
        });
      } else {
        const vendors = await vendorModel
          .find({ status: 'pending' })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalVendors = await vendorModel
          .find({
            status: 'pending',
          })
          .countDocuments();
        responseReturn(res, 200, {
          vendors,
          totalVendors,
          totalPages: Math.ceil(totalVendors / perPage),
          currentPage: parseInt(page),
          perPage: parseInt(perPage),
          message: 'Vendors retrieved successfully.',
        });
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      responseReturn(res, 500, {
        error: 'Internal server error. Please try again later.',
      });
    }
  }; // End of get vendors method
}

module.exports = new vendorController();