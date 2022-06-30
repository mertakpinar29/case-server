import mongoose from "mongoose";

const schema = mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      maxlength: 3,
      required: true,
    },
    stripeCheckoutIdentifier: {
      type: String,
      required: true,
      unique: true,
    },
    paymentIntent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", schema);
