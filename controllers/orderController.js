// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


// //placing user order from frontend

//  const placeOrder = async (res,req)=>{

//     const frontend_url = "http://localhost:5173"

//      try {
//         const newOrder = new orderModel({
//             userId:req.body.userId,
//             items:req.body.items,
//             amount:req.body.amount,
//             address:req.body.address
//         })

//         await newOrder.save();
//         await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

//         const line_items =req.body.items.map(()=>({
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:item.name
//                 },
//                 unit_amount:item.price*100*80
//             },
//             quantity:item.quantity
//         }))

//         line_items.push({
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:"Delivery Charges"
//                 },
//                 unit_amount:2*100*80
//             },
//             quantity:1
//         })

//         const session = await stripe.checkout.sessions.create({
//             line_items:line_items,
//             mode:"payment",
//             success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`
//         })

//         res.json({success:true,session_url:session.url})
//      } catch (error) {

//         console.log(error);
//         res.json({success:false,message:"Error"});
        
//      }


//  }


//  export {placeOrder};

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Place order and create Stripe checkout session
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5174";

  try {
    const userId = req.userId || req.body.userId; // from auth middleware or fallback

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    // 1️⃣ Save new order
    const newOrder = new orderModel({
      userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // 2️⃣ Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // 3️⃣ Prepare Stripe line items
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Stripe expects integer (in paise)
      },
      quantity: item.quantity,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200, // ₹2.00
      },
      quantity: 1,
    });

    // 4️⃣ Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // 5️⃣ Respond with session URL
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ success: false, message: "Server error creating order" });
  }
};

// ✅ Verify payment success/failure
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed, order removed" });
    }
  } catch (error) {
    console.error("Verify Order Error:", error);
    res.status(500).json({ success: false, message: "Server error verifying order" });
  }
};

// ✅ Fetch all orders for a logged-in user
const userOrders = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching orders" });
  }
};


//Listing orders for admin panel
const listOrders = async (req,res)=>{


try {
  const orders = await orderModel.find({});
  res.json({success:true,data:orders})
  
} catch (error) {
  console.log(error);
  res.jso({success:false,message:"Error"})
}

}


//api for updating order status

const updateStatus = async (req,res) =>{
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
    res.json({success:true,message:"Status Updated"})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
    
    
  }

}

export { placeOrder, verifyOrder, userOrders ,listOrders,updateStatus};
