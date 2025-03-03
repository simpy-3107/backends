const Product = require("../models/product");

module.exports.create = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const image = req.files ? req.files.map((file) => file.path) : null;
    console.log(image);
    if (!name || !description || !price || !image) {
      const missingFields = [];

      if (!name) missingFields.push("name");
      if (!description) missingFields.push("description");
      if (!price) missingFields.push("price");
      if (!image) missingFields.push("image");

      return res
        .status(400)
        .json({
          message: `Please provide the following fields: ${missingFields.join(
            ", "
          )}`,
        });
    }

    console.log("Product data:", { name, description, price, image });

    const product = await Product.create({
      name,
      description,
      price,
      image,
      seller: req.user._id,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error creating product:", err); // Log detailed error
    res
      .status(500)
      .json({ message: "Error creating product", error: err.message || err });
  }
};