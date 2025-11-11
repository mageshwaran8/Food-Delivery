// import userModel from "../models/userModel.js"


// //add items to user cart

// const addToCart = async (req,res) =>{
//     try {
//         let userData = await userModel.findById(req.body.userId);
//         let cartData = await userData.cartData;
//         if (!cartData[req.body.itemId]) {

//             cartData[req.body.itemId] = 1;

            
//         }
//         else{
//             cartData[req.body.itemId] +=1;

//         }
//         await userModel.findByIdAndUpdate(req.body.userId,{cartData});
//         res.json({success:true,message:"Added to Cart"});
        
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:"Error"});
        
        
//     }

// }


// // remove items from user cart

// const removeFromCart = async (req,res) =>{
//     try {
//         let userData = await userModel.findById(req.body.userId);
//         let cartData = await userData.cartData;
//         if (cartData[req.body.itemId]>0) {
//             cartData[req.body.itemId] -= 1;
//         }
//         await userModel.findByIdAndUpdate(req.body.userId,{cartData});
//         res.json({success:true,message:"Removed From Cart"})
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:"Error"});
        
        
//     }

// }

// //fetch user cart data

// const getCart = async (req,res) => {

//     try {
//         let userData = await userModel.findById(req.body.userId);
//         let cartData = await userData.cartData;
//         res.json({success:true,cartData})
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:"Error"});
        
//     }

// }

// export{addToCart,removeFromCart,getCart};
import userModel from "../models/userModel.js";

// Add item to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body; // ✅ matches frontend body
    console.log("itemId:", itemId, "userId:", req.userId); // debug

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Missing itemId" });
    }

    const userData = await userModel.findById(req.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(req.userId, { cartData });

    res.json({ success: true, message: "Added to cart", cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body; // ✅ same here
    const userData = await userModel.findById(req.userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    let cartData = userData.cartData || {};
    if (cartData[itemId] && cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId];
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, message: "Removed from cart", cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

// Get user cart
const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId);
    if (!userData) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
