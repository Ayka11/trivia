const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function writeCollection(db, collection, docs) {
  for (const doc of docs || []) {
    const { id, ...data } = doc;
    await db.collection(collection).doc(id).set(data, { merge: true });
  }
  console.log(`Seeded ${docs?.length || 0} docs -> ${collection}`);
}

async function main() {
  const serviceAccountPath = path.resolve(requireEnv("GOOGLE_APPLICATION_CREDENTIALS"));
  const seedPath = path.resolve(process.env.SEED_FILE || "./seed_firestore.json");

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  await writeCollection(db, "modes", seed.modes);
  await writeCollection(db, "shopPacks", seed.shopPacks);
  await writeCollection(db, "questions", seed.questions);

  console.log("Firestore seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
