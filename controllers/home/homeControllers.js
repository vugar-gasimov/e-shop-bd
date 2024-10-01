const moment = require('moment');
const {
  mongo: { ObjectId },
} = require('mongoose');

const { responseReturn } = require('../../utils/response');
const queryProducts = require('../../utils/queryProducts');

const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const reviewModel = require('../../models/reviewModel');

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
      console.log(error.message);
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
      console.log(error.message);
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
      console.log(error.message);
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
      console.log(error.message);
    }
  };
  // End of get query products method

  product_details = async (req, res) => {
    const { slug } = req.params;
    try {
      const product = await productModel.findOne({ slug });

      const relatedProducts = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product._id,
              },
            },
            {
              category: {
                $eq: product.category,
              },
            },
          ],
        })
        .limit(12);

      const sameVendorProducts = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product._id,
              },
            },
            {
              vendorId: {
                $eq: product.vendorId,
              },
            },
          ],
        })
        .limit(3);

      responseReturn(res, 200, {
        product,
        relatedProducts,
        sameVendorProducts,
        success: true,
        message: 'Product details fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get product details method

  customer_review = async (req, res) => {
    const { productId, rating, review, name } = req.body;

    try {
      await reviewModel.create({
        productId,
        name,
        rating,
        review,
        date: moment(Date.now()).format('LL'),
      });
      let rat = 0;
      const reviews = await reviewModel.find({ productId });

      for (let i = 0; i < reviews.length; i++) {
        rat = rat + reviews[i].rating;
      }
      let productRating = 0;
      if (reviews.length !== 0) {
        productRating = (rat / reviews.length).toFixed(1);
      }
      await productModel.findByIdAndUpdate(productId, {
        rating: productRating,
      });
      responseReturn(res, 201, {
        success: true,
        message: 'Product review submitted successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of post customer review

  get_reviews = async (req, res) => {
    const { productId } = req.params;
    const { pageNu } = req.query;
    pageNu = parseInt(pageNu);
    const limit = 5;
    const skipPage = limit * (pageNu - 1);
    try {
      let getRating = await reviewModel.aggregate([
        {
          $match: {
            productId: {
              $eq: new ObjectId(productId),
            },
            rating: {
              $not: {
                $size: 0,
              },
            },
          },
        },
        {
          $unwind: '$rating',
        },
        {
          $group: {
            _id: '$rating',
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      let rating_review = [
        {
          rating: 5,
          sum: 0,
        },
        {
          rating: 4,
          sum: 0,
        },
        {
          rating: 3,
          sum: 0,
        },
        {
          rating: 2,
          sum: 0,
        },
        {
          rating: 1,
          sum: 0,
        },
      ];
      for (let i = 0; i < rating_review.length; i++) {
        for (let c = 0; c < getRating.length; c++) {
          if (rating_review[i].rating === getRating[c]._id) {
            rating_review[i].sum = getRating[c].count;
            break;
          }
        }
      }
      const getAll = await reviewModel.find({
        productId,
      });
      const reviews = await reviewModel
        .find({
          productId,
        })
        .skip(skipPage)
        .limit(limit)
        .sort({ createdAt: -1 });
      responseReturn(res, 201, {
        reviews,
        totalReview: getAll.length,
        rating_review,
        success: true,
        message: 'Product reviews fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get product reviews
}

module.exports = new homeControllers();
