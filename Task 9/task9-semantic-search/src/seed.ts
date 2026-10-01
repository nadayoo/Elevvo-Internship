import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getEmbedding } from "./services/embedding.service";

const prisma = new PrismaClient();

const products = [
  { name: "Warm Lightweight Jacket", description: "Perfect for winter hiking, waterproof and breathable", price: 89.99 },
  { name: "Running Shoes Pro", description: "Lightweight shoes for marathon training and daily runs", price: 129.99 },
  { name: "Cotton T-Shirt", description: "Soft everyday cotton t-shirt in multiple colors", price: 24.99 },
  { name: "Winter Hiking Boots", description: "Insulated boots for cold weather mountain trails", price: 159.99 },
  { name: "Yoga Mat Premium", description: "Non-slip thick mat for yoga and pilates", price: 49.99 },
  { name: "Down Puffer Coat", description: "Heavy insulated coat for freezing winter temperatures", price: 199.99 },
  { name: "Wool Scarf", description: "Soft merino wool scarf to keep your neck warm in the cold", price: 34.99 },
  { name: "Waterproof Rain Jacket", description: "Packable shell for rainy weather and light trekking", price: 74.99 },
  { name: "Bluetooth Headphones", description: "Wireless noise cancelling headphones with 30 hour battery", price: 149.99 },
  { name: "Stainless Steel Water Bottle", description: "Insulated bottle keeps drinks cold for 24 hours", price: 27.99 },
  { name: "Camping Tent 2-Person", description: "Lightweight tent for backpacking and outdoor camping", price: 119.99 },
  { name: "Laptop Backpack", description: "Water-resistant backpack with padded compartment for 15 inch laptops", price: 59.99 },
  { name: "جاكيت شتوي دافئ", description: "جاكيت سميك ومبطن للطقس البارد والرحلات الجبلية", price: 94.99 },
  { name: "حذاء رياضي للجري", description: "حذاء خفيف ومريح للجري والتمارين اليومية", price: 110.0 },
  { name: "سماعات لاسلكية", description: "سماعات بلوتوث بجودة صوت عالية وبطارية تدوم طويلا", price: 79.99 },
];

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM "Product"`);

  for (const p of products) {
    const embedding = await getEmbedding(`${p.name}. ${p.description}`);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Product" (id, name, description, price, embedding, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::vector, NOW())`,
      p.name,
      p.description,
      p.price,
      `[${embedding.join(",")}]`
    );

    console.log(`Seeded: ${p.name}`);
  }
}

main()
  .then(() => console.log("Seeding complete!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());