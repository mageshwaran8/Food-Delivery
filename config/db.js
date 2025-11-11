import mongoose from "mongoose";

export const connectDB =async () => {
    await mongoose.connect('mongodb+srv://mageshwaran:Leodass19@cluster0.n02cvhh.mongodb.net/FoodDelivery').then(()=>console.log("DB Connected"));
}