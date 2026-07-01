/**
 * SHAADIOS – Express + MongoDB Backend
 * Covers all API endpoints used by the React frontend.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "shaadios";
const JWT_SECRET = process.env.JWT_SECRET || "shaadios_secret";
const JWT_HOURS = parseInt(process.env.JWT_EXPIRY_HOURS || "168");

// ─── MongoDB ──────────────────────────────────────────────────────────────────
// Cached client for serverless warm starts — avoids reconnecting on every request
let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    db = cachedDb;
    return;
  }
  const client = new MongoClient(MONGO_URL, { serverApi: ServerApiVersion.v1 });
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(DB_NAME);
  db = cachedDb;
  console.log(`[db] Connected to MongoDB: ${DB_NAME}`);
  await seedVendors();
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────
const nowISO = () => new Date().toISOString();

const makeToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${JWT_HOURS}h` });

const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ detail: "Missing token" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.collection("users").findOne({ id: payload.sub }, { projection: { _id: 0 } });
    if (!user) return res.status(401).json({ detail: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
};

const ownWedding = async (wid, userId) => {
  const w = await db.collection("weddings").findOne({ id: wid, user_id: userId }, { projection: { _id: 0 } });
  if (!w) throw Object.assign(new Error("Wedding not found"), { status: 404 });
  return w;
};

const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    res.status(err.status || 500).json({ detail: err.message || "Internal server error" });
  }
};

// ─── Vendor Seed Data ─────────────────────────────────────────────────────────
const VENDORS = [
  { id: "v1",  name: "Ravi Photography",    category: "Photographer",  city: "Mumbai",    rating: 4.9, reviews: 312, price_from: 75000,  tags: ["Candid","Cinematic","Pre-wedding"],         image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80" },
  { id: "v2",  name: "Mehta Caterers",      category: "Caterer",       city: "Delhi",     rating: 4.8, reviews: 528, price_from: 950,    tags: ["North Indian","Buffet","Live Counters"],    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80" },
  { id: "v3",  name: "Bloom Decor",         category: "Decorator",     city: "Jaipur",    rating: 4.7, reviews: 203, price_from: 120000, tags: ["Floral","Mandap","Lighting"],               image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80" },
  { id: "v4",  name: "Priya Makeup Studio", category: "Makeup Artist", city: "Bangalore", rating: 4.9, reviews: 187, price_from: 25000,  tags: ["Bridal","HD Makeup","Airbrush"],            image: "https://images.unsplash.com/photo-1487412840181-f56e20b4de36?w=600&q=80" },
  { id: "v5",  name: "DJ Rohit Beats",      category: "DJ",            city: "Hyderabad", rating: 4.6, reviews: 94,  price_from: 45000,  tags: ["Bollywood","Punjabi","Live Mix"],           image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80" },
  { id: "v6",  name: "Sharma Lens Works",   category: "Photographer",  city: "Pune",      rating: 4.7, reviews: 241, price_from: 55000,  tags: ["Traditional","Portrait","Drone"],           image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80" },
  { id: "v7",  name: "Royal Feast Catering",category: "Caterer",       city: "Chennai",   rating: 4.5, reviews: 389, price_from: 700,    tags: ["South Indian","Veg","Banana Leaf"],         image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80" },
  { id: "v8",  name: "Dream Petals",        category: "Decorator",     city: "Mumbai",    rating: 4.8, reviews: 156, price_from: 95000,  tags: ["Luxury","Theme","Entrance Decor"],          image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80" },
  { id: "v9",  name: "Glamour by Neha",     category: "Makeup Artist", city: "Delhi",     rating: 4.8, reviews: 264, price_from: 30000,  tags: ["Celebrity Style","Natural Glow","Bridal"], image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80" },
  { id: "v10", name: "BeatMaster Pro",      category: "DJ",            city: "Goa",       rating: 4.7, reviews: 78,  price_from: 60000,  tags: ["EDM","Retro","Sangeet Specialist"],         image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80" },
  { id: "v11", name: "Kapoor Click Studio", category: "Photographer",  city: "Kolkata",   rating: 4.6, reviews: 173, price_from: 40000,  tags: ["Bengali Wedding","Album","Video"],          image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80" },
  { id: "v12", name: "Spice Route Catering",category: "Caterer",       city: "Ahmedabad", rating: 4.9, reviews: 441, price_from: 850,    tags: ["Gujarati Thali","Jain Menu","Rajasthani"],  image: "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=600&q=80" },
];

async function seedVendors() {
  const col = db.collection("vendors");
  for (const v of VENDORS) {
    await col.updateOne({ id: v.id }, { $setOnInsert: v }, { upsert: true });
  }
  console.log(`[db] ${VENDORS.length} vendors seeded`);
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════
const authRouter = express.Router();

authRouter.post("/register", wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ detail: "name, email and password required" });
  const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ detail: "Email already registered" });
  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email: email.toLowerCase(), password_hash, created_at: nowISO() };
  await db.collection("users").insertOne(user);
  const token = makeToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}));

authRouter.post("/login", wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await db.collection("users").findOne({ email: email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ detail: "Invalid credentials" });
  const token = makeToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}));

authRouter.get("/me", authMiddleware, wrap(async (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
}));

// ═════════════════════════════════════════════════════════════════════════════
// WEDDINGS
// ═════════════════════════════════════════════════════════════════════════════
const weddingRouter = express.Router();
weddingRouter.use(authMiddleware);

weddingRouter.get("/", wrap(async (req, res) => {
  const docs = await db.collection("weddings")
    .find({ user_id: req.user.id }, { projection: { _id: 0 } })
    .sort({ created_at: -1 }).toArray();
  res.json(docs);
}));

weddingRouter.post("/", wrap(async (req, res) => {
  const { bride_name, groom_name, wedding_date, venue = "", city, total_budget = 1500000, tradition = "Hindu" } = req.body;
  const doc = { id: uuidv4(), user_id: req.user.id, bride_name, groom_name, wedding_date, venue, city, total_budget: Number(total_budget), tradition, created_at: nowISO() };
  await db.collection("weddings").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

// ═════════════════════════════════════════════════════════════════════════════
// GUESTS
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/guests", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const guests = await db.collection("guests")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ name: 1 }).toArray();
  res.json(guests);
}));

weddingRouter.post("/:wid/guests", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { name, relation = "", side = "bride", family = "", mobile = "", rsvp_status = "pending", plus_ones = 0, is_vip = false, is_elderly = false } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, name, relation, side, family, mobile, rsvp_status, plus_ones: Number(plus_ones), is_vip, is_elderly, created_at: nowISO() };
  await db.collection("guests").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.patch("/:wid/guests/:gid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const allowed = ["rsvp_status", "plus_ones", "is_vip", "is_elderly"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  await db.collection("guests").updateOne({ id: req.params.gid, wedding_id: req.params.wid }, { $set: update });
  res.json({ ok: true });
}));

weddingRouter.delete("/:wid/guests/:gid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("guests").deleteOne({ id: req.params.gid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

// ═════════════════════════════════════════════════════════════════════════════
// BUDGET / EXPENSES
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/expenses", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const expenses = await db.collection("expenses")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ created_at: -1 }).toArray();
  res.json(expenses);
}));

weddingRouter.post("/:wid/expenses", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { category, description, amount, vendor_name = "" } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, category, description, amount: Number(amount), vendor_name, created_at: nowISO() };
  await db.collection("expenses").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.delete("/:wid/expenses/:eid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("expenses").deleteOne({ id: req.params.eid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

weddingRouter.get("/:wid/budget/summary", wrap(async (req, res) => {
  const w = await ownWedding(req.params.wid, req.user.id);
  const expenses = await db.collection("expenses").find({ wedding_id: req.params.wid }).toArray();
  const total_budget = w.total_budget || 0;
  const total_spent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = total_budget - total_spent;
  const percent_used = total_budget ? (total_spent / total_budget) * 100 : 0;
  const by_category = {};
  for (const e of expenses) by_category[e.category] = (by_category[e.category] || 0) + e.amount;
  res.json({ total_budget, total_spent, remaining, percent_used, by_category, alert: percent_used > 100 ? "overspending" : "ok" });
}));

// ═════════════════════════════════════════════════════════════════════════════
// TIMELINE — EVENTS
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/events", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const events = await db.collection("events")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ event_date: 1 }).toArray();
  res.json(events);
}));

weddingRouter.post("/:wid/events", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { title, event_type = "Custom", event_date, venue = "", notes = "" } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, title, event_type, event_date, venue, notes, created_at: nowISO() };
  await db.collection("events").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.delete("/:wid/events/:eid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("events").deleteOne({ id: req.params.eid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

// ═════════════════════════════════════════════════════════════════════════════
// TIMELINE — TASKS
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/tasks", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const tasks = await db.collection("tasks")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ created_at: 1 }).toArray();
  res.json(tasks);
}));

weddingRouter.post("/:wid/tasks", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { title, due_date = "", assigned_to = "", event_id = "" } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, title, due_date, assigned_to, event_id, done: false, created_at: nowISO() };
  await db.collection("tasks").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.patch("/:wid/tasks/:tid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const allowed = ["done", "title", "due_date", "assigned_to"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  await db.collection("tasks").updateOne({ id: req.params.tid, wedding_id: req.params.wid }, { $set: update });
  res.json({ ok: true });
}));

weddingRouter.delete("/:wid/tasks/:tid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("tasks").deleteOne({ id: req.params.tid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

// ═════════════════════════════════════════════════════════════════════════════
// SMART PLAN (data-driven)
// ═════════════════════════════════════════════════════════════════════════════
const TRADITION_EVENTS = {
  Hindu:     ["Roka","Engagement","Haldi","Mehendi","Sangeet","Wedding","Reception"],
  Muslim:    ["Engagement","Mehndi Night","Nikah","Walima"],
  Sikh:      ["Roka","Chunni Ceremony","Anand Karaj","Reception"],
  Christian: ["Engagement","Bridal Shower","Wedding Ceremony","Reception"],
  default:   ["Engagement","Pre-wedding","Wedding","Reception"],
};
const DEFAULT_TASKS = [
  "Book main venue","Hire photographer","Finalise caterer",
  "Send invitations","Book accommodation for outstation guests",
  "Arrange transportation","Order wedding outfits","Book makeup artist",
  "Confirm guest RSVPs","Prepare seating arrangement",
];

weddingRouter.post("/:wid/smart-plan", wrap(async (req, res) => {
  const w = await ownWedding(req.params.wid, req.user.id);
  const tradition = w.tradition || "Hindu";
  const suggested_events = TRADITION_EVENTS[tradition] || TRADITION_EVENTS.default;
  res.json({ tradition, suggested_events });
}));

weddingRouter.post("/:wid/smart-plan/apply", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  let count = 0;
  for (const title of DEFAULT_TASKS) {
    const exists = await db.collection("tasks").findOne({ wedding_id: req.params.wid, title });
    if (!exists) {
      await db.collection("tasks").insertOne({ id: uuidv4(), wedding_id: req.params.wid, title, done: false, due_date: "", assigned_to: "", event_id: "", created_at: nowISO() });
      count++;
    }
  }
  res.json({ tasks_created: count });
}));

// ═════════════════════════════════════════════════════════════════════════════
// INVITATIONS
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/invitations", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const invs = await db.collection("invitations")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ created_at: -1 }).toArray();
  res.json(invs);
}));

weddingRouter.post("/:wid/invitations", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { title, message, template = "marigold" } = req.body;
  const slug = crypto.randomBytes(6).toString("base64url");
  const doc = { id: uuidv4(), wedding_id: req.params.wid, title, message, template, slug, created_at: nowISO() };
  await db.collection("invitations").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

// ═════════════════════════════════════════════════════════════════════════════
// HUB
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/hub", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const posts = await db.collection("hub")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ created_at: -1 }).toArray();
  res.json(posts);
}));

weddingRouter.post("/:wid/hub", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { kind = "announcement", title = "", content } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, kind, title, content, author: req.user.name, created_at: nowISO() };
  await db.collection("hub").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.delete("/:wid/hub/:pid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("hub").deleteOne({ id: req.params.pid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

// ═════════════════════════════════════════════════════════════════════════════
// ACCOMMODATION
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/rooms", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const rooms = await db.collection("rooms")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } }).toArray();
  res.json(rooms);
}));

weddingRouter.post("/:wid/rooms", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { hotel_name, room_number, capacity = 2 } = req.body;
  const doc = { id: uuidv4(), wedding_id: req.params.wid, hotel_name, room_number, capacity: Number(capacity), guest_id: null, created_at: nowISO() };
  await db.collection("rooms").insertOne(doc);
  const { _id, ...clean } = doc;
  res.json(clean);
}));

weddingRouter.patch("/:wid/rooms/:rid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("rooms").updateOne(
    { id: req.params.rid, wedding_id: req.params.wid },
    { $set: { guest_id: req.body.guest_id ?? null } }
  );
  res.json({ ok: true });
}));

weddingRouter.delete("/:wid/rooms/:rid", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  await db.collection("rooms").deleteOne({ id: req.params.rid, wedding_id: req.params.wid });
  res.json({ ok: true });
}));

weddingRouter.post("/:wid/rooms/auto-allocate", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const rooms = await db.collection("rooms").find({ wedding_id: req.params.wid, guest_id: null }).toArray();
  const guests = await db.collection("guests")
    .find({ wedding_id: req.params.wid, rsvp_status: "confirmed" })
    .sort({ is_vip: -1, is_elderly: -1 }).toArray();
  let assigned = 0;
  for (let i = 0; i < Math.min(rooms.length, guests.length); i++) {
    await db.collection("rooms").updateOne({ id: rooms[i].id }, { $set: { guest_id: guests[i].id } });
    assigned++;
  }
  res.json({ assigned });
}));

// ═════════════════════════════════════════════════════════════════════════════
// HEADCOUNT
// ═════════════════════════════════════════════════════════════════════════════
const REGION_RATE = { "North India": 0.85, "South India": 0.80, "East India": 0.78, "West India": 0.82 };
const FOOD_KG = {
  "North Indian":  { rice: 0.15, dal: 0.12, sabzi: 0.18, bread: 0.10, dessert: 0.12 },
  "South Indian":  { rice: 0.25, sambar: 0.15, rasam: 0.10, dessert: 0.10 },
  default:         { food: 0.40 },
};

weddingRouter.post("/:wid/headcount", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const { region = "North India", cuisine = "North Indian", veg_ratio = 0.7 } = req.body;
  const guests = await db.collection("guests").find({ wedding_id: req.params.wid }).toArray();
  const confirmed = guests.filter(g => g.rsvp_status === "confirmed").length;
  const pending   = guests.filter(g => g.rsvp_status === "pending").length;
  const rate = REGION_RATE[region] ?? 0.80;
  const forecast = Math.round(confirmed + pending * rate);
  const foodMap = FOOD_KG[cuisine] || FOOD_KG.default;
  const kgPerPerson = Object.values(foodMap).reduce((a, b) => a + b, 0);
  const total_kg = +(forecast * kgPerPerson).toFixed(1);
  res.json({
    total_invited: guests.length, confirmed, pending, forecast_attendance: forecast,
    food: {
      total_kg,
      veg_kg: +(total_kg * veg_ratio).toFixed(1),
      non_veg_kg: +(total_kg * (1 - veg_ratio)).toFixed(1),
      breakdown: Object.fromEntries(Object.entries(foodMap).map(([k, v]) => [k, +(v * forecast).toFixed(1)])),
    },
    parking_slots: Math.round(forecast * 0.3),
    tables_of_10: Math.round(forecast / 10) + 1,
  });
}));

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/analytics", wrap(async (req, res) => {
  const w = await ownWedding(req.params.wid, req.user.id);
  const guests   = await db.collection("guests").find({ wedding_id: req.params.wid }).toArray();
  const expenses = await db.collection("expenses").find({ wedding_id: req.params.wid }).toArray();
  const confirmed = guests.filter(g => g.rsvp_status === "confirmed").length;
  const pending   = guests.filter(g => g.rsvp_status === "pending").length;
  const forecast  = Math.round(confirmed + pending * 0.55);
  const total_budget = w.total_budget || 0;
  const total_spent  = expenses.reduce((s, e) => s + e.amount, 0);
  const percent_used = total_budget ? (total_spent / total_budget) * 100 : 0;
  const overrun = Math.max(0, total_spent - total_budget);
  const risks = [];
  if (percent_used > 90) risks.push({ severity: "high", msg: `Budget at ${percent_used.toFixed(0)}% — nearing limit` });
  else if (percent_used > 75) risks.push({ severity: "med", msg: `Budget at ${percent_used.toFixed(0)}% — watch spending` });
  if (pending > guests.length * 0.4) risks.push({ severity: "med", msg: `${pending} guests haven't RSVPed — send reminders` });
  if (confirmed === 0 && guests.length > 0) risks.push({ severity: "high", msg: "No guests confirmed yet" });
  let health = 100;
  if (percent_used > 100) health -= Math.min(40, Math.round(percent_used * 0.4));
  if (pending > guests.length * 0.5) health -= 10;
  if (confirmed === 0 && guests.length > 0) health -= 10;
  health = Math.max(0, Math.min(100, health));
  res.json({
    health_score: health,
    attendance: { forecast, confirmed, pending, total: guests.length },
    food: { forecast_kg: +(forecast * 0.4).toFixed(1), meals: forecast },
    budget: { total: total_budget, spent: total_spent, percent_used, forecast_overrun: overrun },
    risks,
  });
}));

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.get("/:wid/export/guests.csv", wrap(async (req, res) => {
  await ownWedding(req.params.wid, req.user.id);
  const guests = await db.collection("guests")
    .find({ wedding_id: req.params.wid }, { projection: { _id: 0 } })
    .sort({ name: 1 }).toArray();
  const headers = ["name","relation","side","family","mobile","rsvp_status","plus_ones"];
  const rows = guests.map(g => headers.map(h => `"${(g[h] ?? "").toString().replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=guests.csv");
  res.send(csv);
}));

weddingRouter.get("/:wid/export/report.pdf", wrap(async (req, res) => {
  const w = await ownWedding(req.params.wid, req.user.id);
  const guests   = await db.collection("guests").find({ wedding_id: req.params.wid }).toArray();
  const expenses = await db.collection("expenses").find({ wedding_id: req.params.wid }).toArray();
  const confirmed  = guests.filter(g => g.rsvp_status === "confirmed").length;
  const total_spent = expenses.reduce((s, e) => s + e.amount, 0);
  // Simple plain-text "PDF" — a full PDF library can be added later
  const text = [
    `SHAADIOS — Wedding Report`,
    `================================`,
    `${w.bride_name} weds ${w.groom_name}`,
    `Date   : ${w.wedding_date}`,
    `Venue  : ${w.venue || "—"}`,
    `City   : ${w.city}`,
    ``,
    `GUESTS`,
    `  Invited  : ${guests.length}`,
    `  Confirmed: ${confirmed}`,
    `  Pending  : ${guests.filter(g => g.rsvp_status === "pending").length}`,
    `  Declined : ${guests.filter(g => g.rsvp_status === "rejected").length}`,
    ``,
    `BUDGET`,
    `  Total Budget : ₹${w.total_budget?.toLocaleString("en-IN") || 0}`,
    `  Total Spent  : ₹${total_spent.toLocaleString("en-IN")}`,
    `  Remaining    : ₹${(w.total_budget - total_spent).toLocaleString("en-IN")}`,
    ``,
    `GUEST LIST`,
    ...guests.map(g => `  ${g.name} | ${g.relation || ""} | ${g.side} | ${g.rsvp_status}`),
  ].join("\n");
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=wedding-report.txt");
  res.send(text);
}));

// ═════════════════════════════════════════════════════════════════════════════
// VENDORS
// ═════════════════════════════════════════════════════════════════════════════
const vendorRouter = express.Router();
vendorRouter.get("/", wrap(async (req, res) => {
  const query = req.query.category ? { category: req.query.category } : {};
  const vendors = await db.collection("vendors").find(query, { projection: { _id: 0 } }).toArray();
  res.json(vendors);
}));

vendorRouter.post("/book", authMiddleware, wrap(async (req, res) => {
  const { wedding_id, vendor_id } = req.body;
  await ownWedding(wedding_id, req.user.id);
  const doc = { id: uuidv4(), user_id: req.user.id, wedding_id, vendor_id, status: "pending", created_at: nowISO() };
  await db.collection("bookings").insertOne(doc);
  res.json({ ok: true, booking_id: doc.id });
}));

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC INVITATIONS (no auth)
// ═════════════════════════════════════════════════════════════════════════════
const publicRouter = express.Router();

publicRouter.get("/invitations/:slug", wrap(async (req, res) => {
  const inv = await db.collection("invitations").findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!inv) return res.status(404).json({ detail: "Invitation not found" });
  const wedding = await db.collection("weddings").findOne({ id: inv.wedding_id }, { projection: { _id: 0, password_hash: 0 } });
  res.json({ invitation: inv, wedding });
}));

publicRouter.post("/invitations/:slug/rsvp", wrap(async (req, res) => {
  const inv = await db.collection("invitations").findOne({ slug: req.params.slug });
  if (!inv) return res.status(404).json({ detail: "Invitation not found" });
  const { name, mobile = "", rsvp_status = "confirmed", plus_ones = 0, message = "" } = req.body;
  await db.collection("rsvps").insertOne({ id: uuidv4(), invitation_id: inv.id, wedding_id: inv.wedding_id, name, mobile, rsvp_status, plus_ones: Number(plus_ones), message, created_at: nowISO() });
  // Upsert guest record
  await db.collection("guests").updateOne(
    { wedding_id: inv.wedding_id, mobile: mobile || name },
    { $setOnInsert: { id: uuidv4(), wedding_id: inv.wedding_id, name, mobile, relation: "Guest", side: "both", family: "", rsvp_status, plus_ones: Number(plus_ones), is_vip: false, is_elderly: false, created_at: nowISO() } },
    { upsert: true }
  );
  res.json({ ok: true });
}));

// ═════════════════════════════════════════════════════════════════════════════
// AGENTS / ASSISTANT — stubs (frontend shows toast, no crash)
// ═════════════════════════════════════════════════════════════════════════════
weddingRouter.post("/:wid/agents/:agent", (req, res) => {
  res.status(503).json({ detail: "AI agents not configured in this setup." });
});

app.post("/api/assistant/chat", (req, res) => {
  res.status(503).json({ detail: "AI assistant not configured in this setup." });
});

app.get("/api/assistant/history/:sid", (req, res) => res.json([]));

// ═════════════════════════════════════════════════════════════════════════════
// HEALTH
// ═════════════════════════════════════════════════════════════════════════════
app.get("/api/health", async (req, res) => {
  try { await db.command({ ping: 1 }); res.json({ status: "ok", db: true }); }
  catch { res.json({ status: "degraded", db: false }); }
});

// ─── Mount routers ────────────────────────────────────────────────────────────
app.use("/api/auth",           authRouter);
app.use("/api/weddings",       weddingRouter);
app.use("/api/vendors",        vendorRouter);
app.use("/api/public",         publicRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`[server] SHAADIOS API running on http://localhost:${PORT}`));
  }).catch(err => {
    console.error("[db] Connection failed:", err.message);
    process.exit(1);
  });
}

module.exports = { app, connectDB };
