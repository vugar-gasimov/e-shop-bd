const categoryModel = require('../../models/categoryModel');
const { responseReturn } = require('../../utils/response');

class homeControllers {
  getCategories = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      responseReturn(res, 200, {
        success: true,
        data: categories,
        message: 'Categories fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching categories:', error);

      responseReturn(res, 500, {
        success: false,
        message: 'Failed to fetch categories',
      });
    }
  };
}
// End of get categories method

module.exports = new homeControllers();
