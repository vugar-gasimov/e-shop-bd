const { formidable } = require('formidable');
const { responseReturn } = require('../../utils/response');
class categoryController {
  addCategory = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: 'Something went wrong 404.' });
      } else {
        let { name } = fields;
        let { image } = files;
        name = name.trim();
        const slug = name.split('').join('-');
      }
    });
  };

  getCategory = async (req, res) => {
    console.log('Working');
  };
}

module.exports = new categoryController();
