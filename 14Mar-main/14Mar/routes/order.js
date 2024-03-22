var express = require('express');
var router = express.Router();
const orderModel = require('../model/order')
const InvoiceItemModel = require('../model/invoiceitem');
var responseReturn = require('../helper/ResponseHandle')



//localhost:3000/order
/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    const orderdata = await orderModel.find();
    // res.json(userdata);
    responseReturn.ResponseSend(res, true, 200, orderdata)

  } catch (error) {
    console.error(error); // Log lỗi nếu có
    res.status(500).send('Server Error'); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});
// Lấy dữ liệu sản phẩm dựa trên id
router.get("/:id", async function (req, res, next) {
  const orderId = req.params.id; // Lấy id từ request params
  try {
    const product = await sanphamModel.findById(orderId);

    if (!product) {
      // Kiểm tra nếu không tìm thấy sản phẩm
      return res.status(404).json({ message: "Product not found" });
    }
    responseReturn.ResponseSend(res, true, 200, product)
   
  } catch (error) {
    console.error(error); // Log lỗi nếu có
    res.status(500).send("Server Error"); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});
// Thêm dữ liệu mới
router.post('/checkout', async (req, res) => {
  try {
      const { invoice_date, customer_name, phone, total, status, invoice_items } = req.body;
      console.log(req.body);
      // Tạo một mảng các đối tượng invoice_items từ req.body
      const invoiceItems = req.body.invoice_items.map(item => ({
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity
         
      }));

      // Lưu mảng invoiceItems vào collection invoiceItems
      const savedInvoiceItems = await InvoiceItemModel.insertMany(invoiceItems);

       // Tạo một mảng các đối tượng invoice_items để lưu vào collection Order
       const invoiceItemsIds = savedInvoiceItems.map(item => item._id);

      const newOrder = new orderModel({
          invoice_date,
          customer_name,
          phone,
          total,
          status,
          invoice_items: invoiceItemsIds  // Gán mảng invoiceItems vào invoice_items
      });

      // Lưu đơn hàng mới vào cơ sở dữ liệu
      const savedOrder = await newOrder.save();

      res.status(201).json(savedOrder);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

// Cập nhật dữ liệu
router.put("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { title,description, price, linkImg ,categoryName  } = req.body;
    const updatedProduct = await sanphamModel.findByIdAndUpdate(id, {
      title,
      description,
      price,
      linkImg,
      category: {
        name: categoryName // lưu tên danh mục trong trường category của sản phẩm
      }
      
    }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Xóa dữ liệu
router.delete("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const deletedProduct = await sanphamModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
