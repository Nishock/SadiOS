const { app, connectDB } = require("../server");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("[vercel-handler] Error during function execution:", err);
    res.status(500).json({ detail: "Internal server error initializing database" });
  }
};
