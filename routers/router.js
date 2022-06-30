import express from "express";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// this route will create a checkout session
router.post("/create-session", bodyParser.json(), async (req, res) => {
  try {
    const { amount, currency, itemName, quantity, email } = req.body;
    const existingCustomer = await stripe.customers.list({
      email,
    });
    const session = await stripe.checkout.sessions.create({
      // send customer property only if we have that user
      ...(existingCustomer.data.length > 0 && {
        customer: existingCustomer.data[0].id,
      }),
      mode: "payment",
      success_url: `https://stripe-test-case.netlify.app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://stripe-test-case.netlify.app`,
      ...(existingCustomer.data.length === 0 && { customer_email: email }),
      line_items: [
        {
          amount,
          currency,
          quantity,
          name: itemName,
        },
      ],
    });
    return res.status(201).json({ session });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err, message: err.message });
  }
});

// if payment successful, save it to database
router.get("/payment-success/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const existingPayment = await Payment.findOne({
      stripeCheckoutIdentifier: sessionId,
    });
    if (existingPayment) return res.status(400);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customer = await stripe.customers.retrieve(session.customer);

    const payment = await Payment.create({
      customer: customer.email,
      amount: session.amount_total,
      currency: session.currency,
      stripeCheckoutIdentifier: session.id,
      // payment intent can be used for refunding
      // it is important to have it in database
      paymentIntent: session.payment_intent,
    });
    return res.status(201).json({
      session,
      payment,
      customer,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err, message: err.message });
  }
});

export default router;
