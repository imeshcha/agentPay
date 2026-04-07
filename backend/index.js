require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");


const accountRoutes = require("./routes/account");
const sessionRoutes = require("./routes/session");
const agentRoutes = require("./routes/agent");
const paymentRoutes = require("./routes/payments");
const contactRoutes = require("./routes/contacts");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://arc-agent-pay.vercel.app",
      /\.vercel\.app$/,
      /\.onrender\.com$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Arc Agent Pay backend",
    environment: process.env.NODE_ENV || "development",
    endpoints: [
      "POST /account/create",
      "GET  /account/:address",
      "POST /session/create",
      "GET  /session/:address",
      "POST /agent/message",
      "GET  /payments/:address",
      "GET  /contacts/:address",
      "POST /contacts/add",
      "DELETE /contacts/remove",
    ],
  });
});

app.use("/account", accountRoutes);
app.use("/session", sessionRoutes);
app.use("/agent", agentRoutes);
app.use("/payments", paymentRoutes);
app.use("/contacts", contactRoutes);

// Keep-alive ping — only runs on Render production
// Prevents the free tier from sleeping after 15 minutes
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    try {
      const url =
        process.env.RENDER_EXTERNAL_URL ||
        "https://agentpay-qunp.onrender.com";
      await fetch(url);
      console.log("Keep-alive ping sent to:", url);
    } catch (err) {
      console.log("Keep-alive ping failed:", err.message);
    }
  }, 14 * 60 * 1000); // every 14 minutes
}

app.listen(PORT, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`\nArc Agent Pay backend running on port ${PORT}`);
    console.log(`Environment: production (Render)`);
  } else {
    console.log(`\nArc Agent Pay backend running at http://localhost:${PORT}`);
    console.log(`Environment: development (local)`);
    console.log(`Test it: http://localhost:${PORT}/\n`);
  }
});