const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/pay", async (req, res) => {
  const { amount, description, customer } = req.body;

  try {
    const response = await axios.post(
      "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create",

    );
    // 🔍 Afficher la réponse complète pour debug
    console.log(
      "Réponse PayDunya complète :",
      JSON.stringify(response.data, null, 2)
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating payment" });
  }
});

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
