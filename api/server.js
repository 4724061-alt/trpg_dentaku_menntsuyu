export default function handler(req, res) {
  const fs = require("fs");
  const path = require("path");

  const dbPath = path.join(process.cwd(), "db.json");

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ communities: {}, users: {} }, null, 2));
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (req.method === "POST" && req.url === "/api/community") {
    const { name } = req.body;
    if (!db.communities[name]) db.communities[name] = [];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST" && req.url === "/api/result") {
    const { community, shared, result, timestamp, userId } = req.body;

    if (!db.communities[community]) db.communities[community] = [];
    db.communities[community].push({ shared, result, timestamp, userId });

    if (!db.users[userId]) db.users[userId] = [];
    db.users[userId].push({ community, shared, result, timestamp });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET" && req.url.startsWith("/api/result/")) {
    const community = req.url.split("/").pop();
    const list = db.communities[community] || [];
    return res.status(200).json(list.filter(x => x.shared));
  }

  if (req.method === "GET" && req.url.startsWith("/api/user/")) {
    const userId = req.url.split("/").pop();
    const list = db.users[userId] || [];
    return res.status(200).json(list);
  }

  if (req.method === "GET" && req.url === "/api/communities") {
    return res.status(200).json(Object.keys(db.communities));
  }

  res.status(404).json({ error: "not found" });
}
