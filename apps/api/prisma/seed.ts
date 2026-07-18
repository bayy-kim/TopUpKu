import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@topupku.com' },
    update: {},
    create: {
      email: 'admin@topupku.com',
      passwordHash,
    },
  })
  console.log('Seeded admin:', admin.email)
  const mlbb = await prisma.game.upsert({
    where: { slug: 'mobile-legends' },
    update: {},
    create: {
      name: 'Mobile Legends',
      slug: 'mobile-legends',
      iconUrl: '/icons/mlbb.png',
      products: {
        create: [
          { name: '86 Diamonds', skuCode: 'mlbb-86', priceBuy: 16000, priceSell: 18000 },
          { name: '172 Diamonds', skuCode: 'mlbb-172', priceBuy: 30000, priceSell: 33000 },
          { name: '257 Diamonds', skuCode: 'mlbb-257', priceBuy: 43000, priceSell: 47000 },
          { name: '344 Diamonds', skuCode: 'mlbb-344', priceBuy: 55000, priceSell: 60000 },
          { name: 'Twilight Pass', skuCode: 'mlbb-twilight', priceBuy: 120000, priceSell: 135000 },
        ],
      },
    },
  })

  const ff = await prisma.game.upsert({
    where: { slug: 'free-fire' },
    update: {},
    create: {
      name: 'Free Fire',
      slug: 'free-fire',
      iconUrl: '/icons/ff.png',
      products: {
        create: [
          { name: '70 Diamonds', skuCode: 'ff-70', priceBuy: 7000, priceSell: 8500 },
          { name: '140 Diamonds', skuCode: 'ff-140', priceBuy: 14000, priceSell: 16000 },
          { name: '355 Diamonds', skuCode: 'ff-355', priceBuy: 35000, priceSell: 39000 },
          { name: '720 Diamonds', skuCode: 'ff-720', priceBuy: 70000, priceSell: 77000 },
        ],
      },
    },
  })

  const pubg = await prisma.game.upsert({
    where: { slug: 'pubg-mobile' },
    update: {},
    create: {
      name: 'PUBG Mobile',
      slug: 'pubg-mobile',
      iconUrl: '/icons/pubg.png',
      products: {
        create: [
          { name: '60 UC', skuCode: 'pubg-60', priceBuy: 9000, priceSell: 10500 },
          { name: '300 UC', skuCode: 'pubg-300', priceBuy: 40000, priceSell: 44000 },
          { name: '600 UC', skuCode: 'pubg-600', priceBuy: 75000, priceSell: 82000 },
          { name: '1500 UC', skuCode: 'pubg-1500', priceBuy: 170000, priceSell: 185000 },
        ],
      },
    },
  })

  console.log('Seeded games:', mlbb.name, ff.name, pubg.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
