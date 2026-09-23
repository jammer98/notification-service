import "../src/config/env.js";
import pool from "../src/config/db.js";
import { createApiKey } from "../src/services/apikey.service.js";

const name = process.argv[2];

if(!name) {
    console.log('usage: npm run create:key -- "order-service"');
    process.exit(1);
}

try {
  const created = await createApiKey(name);
  console.log(`\nAPI key created for "${created.name}" (id ${created.id}):\n`);
  console.log(`  ${created.key}\n`);
  console.log("Copy it now. Only its hash is stored , so it cannot be shown again.");  
} finally{
    await pool.end();
}

// 1st api key of a producer : nk_4Gieyj1Q54FGa63uWfgMLnJnYvXd4psUpOHOyL6ZZEU

// nk_2MLyi78MnAXZ1kScEgguU0lOfKTjEOSuBDxQUQO_aTQ