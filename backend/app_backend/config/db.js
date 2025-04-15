import mongoose, { connect } from "mongoose";
const connectDB=async()=>{
    try {
      await mongoose.connect("mongodb+srv://2022dhruvmaurya:aSSgTdN04guLScI7@cluster0.i7jsidr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0") 
      console.log("mongoDB connected") 
    } catch (error) {
        console.log(error)
    }
}
export default connectDB