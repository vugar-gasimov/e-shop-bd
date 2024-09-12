class customerAuthControllers {
  customer_register = async (req, res) => {
    console.log(req.body);

    try {
      responseReturn(res, 200, {
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
  // End of post customer register method
}

module.exports = new customerAuthControllers();
