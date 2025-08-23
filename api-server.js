import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// Leads endpoint for call tracking
app.post("/api/leads/call", async (req, res) => {
  try {
    const data = req.body || {};
    const dir = path.join(process.cwd(), "data");
    const file = path.join(dir, "call-leads.ndjson");
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Append lead data to file
    const logEntry = JSON.stringify({
      ...data,
      received_at: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }) + "\n";
    
    fs.appendFileSync(file, logEntry, "utf8");
    console.log("📞 Call lead captured:", data.name, data.phone);
    
    res.status(200).json({ ok: true, message: "Lead captured successfully" });
  } catch (e) {
    console.error("❌ leads/call error", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`📞 Call leads will be saved to: ${path.join(process.cwd(), "data", "call-leads.ndjson")}`);
});