const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Log des clés pour debug
console.log("🔐 Clés API PayDunya chargées :");
console.log("MASTER KEY :", process.env.PAYDUNYA_MASTER_KEY ? "✅" : "❌");
console.log("PRIVATE KEY :", process.env.PAYDUNYA_PRIVATE_KEY ? "✅" : "❌");
console.log("PUBLIC KEY :", process.env.PAYDUNYA_PUBLIC_KEY ? "✅" : "❌");
console.log("TOKEN :", process.env.PAYDUNYA_TOKEN ? "✅" : "❌");

// Route de paiement
app.post("/api/pay", async (req, res) => {
  const { amount, description, customer } = req.body;

  try {
    const response = await axios.post(
      "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create",
      {
        invoice: {
          items: [
            {
              name: description,
              quantity: 1,
              unit_price: amount,
              total_price: amount,
            },
          ],
          total_amount: amount,
          description: `Paiement pour ${description}`,
        },
        store: {
          name: "omarc gaye",
          tagline: "site de vente",
          phone_number: "781646424",
          postal_address: "Dakar, Sénégal",
        },
        actions: {
          cancel_url: "http://localhost:3000",
          return_url: "http://localhost:3000",
        },
        custom_data: {
          client: customer.name,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
          "PAYDUNYA-PUBLIC-KEY": process.env.PAYDUNYA_PUBLIC_KEY,
        },
      }
    );

    // 🔍 Afficher la réponse complète pour debug
    console.log("🧾 Réponse PayDunya complète :", JSON.stringify(response.data, null, 2));

    // ✅ Lecture sécurisée des données
    const invoiceInfo = response.data.invoice || response.data.response || {};
    const redirectUrl = invoiceInfo.checkout_url || "Lien de paiement introuvable";
    const invoiceUrl = invoiceInfo.invoice_url || "URL de la facture introuvable";

    console.log("✅ URL de la facture générée :", invoiceUrl);
    console.log("✅ Lien de paiement :", redirectUrl);

    res.json({
      redirectUrl,
      invoiceUrl,
    });

  } catch (err) {
    console.error("❌ Erreur PayDunya :", err.response?.data || err.message);
    res.status(500).json({
      error: "Erreur lors de la création de la facture.",
      details: err.response?.data || err.message,
    });
  }
});

// Démarrage serveur
app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
