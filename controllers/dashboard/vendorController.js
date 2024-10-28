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
      console.log(error.message);
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
      console.log(error.message);
    }
  }; // End of get vendors method

  updateVendorStatus = async (req, res) => {
    const { vendorId, status } = req.body;
    try {
      const updatedVendor = await vendorModel.findByIdAndUpdate(
        vendorId,
        { status },
        { new: true }
      );

      if (!updatedVendor) {
        return responseReturn(res, 404, {
          error: 'Vendor not found.',
        });
      }

      responseReturn(res, 200, {
        vendor: updatedVendor,
        message: 'Vendor status updated successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of update vendor status method

  get_activeVendors = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    const skipPage = perPage * (page - 1);

    try {
      if (searchValue) {
        const vendors = await vendorModel
          .find({
            $text: { $search: searchValue },
            status: 'active',
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalVendors = await vendorModel
          .find({
            $text: { $search: searchValue },
            status: 'active',
          })
          .countDocuments();
        responseReturn(res, 200, {
          totalVendors,
          vendors,
        });
      } else {
        const vendors = await vendorModel
          .find({
            status: 'active',
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalVendors = await vendorModel
          .find({
            status: 'active',
          })
          .countDocuments();
        responseReturn(res, 200, {
          totalVendors,
          vendors,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; //End of get active vendors

  get_deactiveVendors = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    const skipPage = perPage * (page - 1);

    try {
      if (searchValue) {
        const vendors = await vendorModel
          .find({
            $text: { $search: searchValue },
            status: 'deactivated',
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalVendors = await vendorModel
          .find({
            $text: { $search: searchValue },
            status: 'deactivated',
          })
          .countDocuments();
        responseReturn(res, 200, {
          totalVendors,
          vendors,
        });
      } else {
        const vendors = await vendorModel
          .find({
            status: 'deactivated',
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalVendors = await vendorModel
          .find({
            status: 'deactivated',
          })
          .countDocuments();
        responseReturn(res, 200, {
          totalVendors,
          vendors,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; //End of get deactivated vendors
}

module.exports = new vendorController();
