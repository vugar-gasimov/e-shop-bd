const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const { responseReturn } = require('../../utils/response');
const queryProducts = require('../../utils/queryProducts');

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

  product_price_range = async (req, res) => {
    try {
      const priceRange = {
        low: 0,
        high: 0,
      };

      const products = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

      const latest_products = this.formateProducts(products);
      const getForPrice = await productModel.find({}).sort({ 'price': 1 });

      if (getForPrice.length > 0) {
        priceRange.high = getForPrice[getForPrice.length - 1].price;
        priceRange.low = getForPrice[0].price;
      }

      responseReturn(res, 200, {
        latest_products,
        priceRange,
        success: true,
        message: 'Product price range fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching products price range:', error);

      responseReturn(res, 500, {
        success: false,
        message: 'Failed to fetch products price range',
      });
    }
  };
  // End of get product price range method

  query_products = async (req, res) => {
    const perPage = 12;
    req.query.perPage = perPage;

    try {
      const products = await productModel.find({}).sort({ createdAt: -1 });

      const totalProducts = new queryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .searchQuery()
        .sortByPrice()
        .productsCount();

      const result = new queryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .searchQuery()
        .sortByPrice()
        .skip()
        .limit()
        .getProducts();

      responseReturn(res, 200, {
        products: result,
        totalProducts,
        perPage,
        success: true,
        message: 'Query products fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching query products:', error);

      responseReturn(res, 500, {
        success: false,
        message: 'Failed to fetch query products',
      });
    }
  };
  // End of get query products method
}

module.exports = new homeControllers();
