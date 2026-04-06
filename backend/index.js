require("dotenv").config();
const express = require("express");
const cors = require("cors");

const accountRoutes = require("./routes/account");
const sessionRoutes = require("./routes/session");
const agentRoutes = require("./routes/agent");
const paymentRoutes = require("./routes/payments");
const contactRoutes = require("./routes/contacts");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Arc Agent Pay backend",
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

app.listen(PORT, () => {
  console.log(`\nArc Agent Pay backend running at http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see all endpoints\n`);
});