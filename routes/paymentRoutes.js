const express = require("express");
const axios = require("axios");

const router = express.Router();


// ============================
// INITIALIZE PAYMENT
// ============================

router.post("/pay", async (req, res) => {

  try {

    const { name, email, amount } = req.body;

    const response = await axios.post(

      "https://api.flutterwave.com/v3/payments",

      {
        tx_ref: `TX-${Date.now()}`,
        amount,
        currency: "XAF",

        redirect_url:
          "http://localhost:3000/payment-success",

        customer: {
          email,
          name
        },

        customizations: {
          title: "Website Payment",
          description: "Payment for products/services"
        }

      },

      {
        headers: {
          Authorization:
            `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type":
            "application/json"
        }
      }

    );

    res.status(200).json(response.data);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.response?.data || error.message
    });

  }

});


// ============================
// VERIFY PAYMENT
// ============================

router.get("/verify/:transaction_id", async (req, res) => {

  try {

    const response = await axios.get(

      `https://api.flutterwave.com/v3/transactions/${req.params.transaction_id}/verify`,

      {
        headers: {
          Authorization:
            `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }

    );

    res.status(200).json(response.data);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.response?.data || error.message
    });

  }

});

router.get("/confirm/:transaction_id/:order_id", async (req, res) => {

    try {

        const transactionId =
            req.params.transaction_id;

        const orderId =
            req.params.order_id;

        const response = await axios.get(

            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,

            {
                headers: {
                    Authorization:
                    `Bearer ${process.env.FLW_SECRET_KEY}`
                }
            }

        );

        if (
            response.data.status === "success" &&
            response.data.data.status === "successful"
        ) {

            db.query(
                `
                UPDATE orders
                SET
                payment_status='paid',
                transaction_id=?
                WHERE id=?
                `,
                [
                    transactionId,
                    orderId
                ]
            );

            return res.json({
                success: true,
                message: "Payment verified"
            });

        }

        return res.status(400).json({
            success: false,
            message: "Payment not successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Verification failed"
        });

    }

});

module.exports = router;