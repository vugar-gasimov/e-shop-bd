const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const { responseReturn } = require('../../utils/response');

class homeControllers {
  formateProducts = (products) => {
    const productArray = [];
    let i = 0;
    while (i < products.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j]);
        }
        j++;
      }
      productArray.push([...temp]);
      i = j;
    }
    return productArray;
  };

  getCategories = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      responseReturn(res, 200, {
        categories,
        success: true,
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
  // End of get categories method

  getProducts = async (req, res) => {
    try {
      const products = await productModel
        .find({})
        .limit(12)
        .sort({ createdAt: -1 });

      const allProducts1 = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });
      const latest_products = this.formateProducts(allProducts1);

      const allProducts2 = await productModel
        .find({})
        .limit(9)
        .sort({ rating: -1 });
      const topRated_products = this.formateProducts(allProducts2);

      const allProducts3 = await productModel
        .find({})
        .limit(9)
        .sort({ discount: -1 });
      const discounted_products = this.formateProducts(allProducts3);

      responseReturn(res, 200, {
        products,
        latest_products,
        topRated_products,
        discounted_products,
        success: true,
        message: 'Products fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching products:', error);

      responseReturn(res, 500, {
        success: false,
        message: 'Failed to fetch products',
      });
    }
  };
  // End of get products method
}

module.exports = new homeControllers();
