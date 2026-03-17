const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://scrapper:scraper@v1ra.jt3fzns.mongodb.net/sanjeevo';
const client = new MongoClient(uri);

async function explore() {
  try {
    await client.connect();
    const db = client.db('sanjeevo');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('--- Collections in "sanjeevo" ---');
    console.log(collections.map(c => c.name));
    
    // Sample a few documents from the first collection
    // Search for documents with any string field containing '@'
    console.log(`\n--- Searching all collections for emails ---`);
    for (const c of collections) {
      if(c.name === 'mediaitems' || c.name === 'sessionproxies' || c.name === 'proxies') continue;
      
      const sample = await db.collection(c.name).findOne({
        $or: [
          { "publicEmail": { $regex: "@", $options: "i" } },
          { "email": { $regex: "@", $options: "i" } },
          { "businessEmail": { $regex: "@", $options: "i" } }
        ]
      });
      
      if(sample) {
        console.log(`\Found email in collection: ${c.name}`);
        console.log(JSON.stringify(sample, null, 2));
        break; // Stop after finding the right schema structure
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

explore();
