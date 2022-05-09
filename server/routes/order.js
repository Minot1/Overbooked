const Order = require("../models/order_dbmod");
const Product = require("../models/product_dbmod");
const {
  verifyToken,
  verifyTokenAndUser,
  verifyTokenOrManager,
  verifyTokenAndManager,
  verifyTokenAndProductManager,
  verifyTokenAndSalesManager
} = require("./verifyToken");

const router = require("express").Router();


async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  const weight = product.amount - quantity;
  if( weight >= 0){
    product.amount -= quantity;
  }

  await product.save({ validateBeforeSave: false });
}

async function reduceAmount(idArray,amountArray){

  for (let i = 0; i < idArray.length; i++) {
    const id = idArray[i]; 
    const reduceAmount = amountArray[i];

    await updateStock(id,reduceAmount);
  }


};


//CREATE

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    const bookArray = savedOrder.bought_products;
    const amountArray = savedOrder.amounts;
    
    reduceAmount(bookArray,amountArray);

    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndUser, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndUser, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenOrManager, async (req, res) => {
  try {
    const orders = await Order.find({ buyer_email: req.params.buyer_email });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL

router.get("/", verifyTokenAndManager, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;