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
    update: { iconUrl: '/images/mlbb-cover.jpg' },
    create: {
      name: 'Mobile Legends',
      slug: 'mobile-legends',
      iconUrl: '/images/mlbb-cover.jpg',
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
    update: { iconUrl: '/images/ff-cover.jpg' },
    create: {
      name: 'Free Fire',
      slug: 'free-fire',
      iconUrl: '/images/ff-cover.jpg',
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
    update: { iconUrl: '/images/pubgm-cover.png' },
    create: {
      name: 'PUBG Mobile',
      slug: 'pubg-mobile',
      iconUrl: '/images/pubgm-cover.png',
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

  const wr = await prisma.game.upsert({
    where: { slug: 'wild-rift' },
    update: {},
    create: {
      name: 'League of Legends Wild Rift',
      slug: 'wild-rift',
      iconUrl: '/images/lol-cover.png',
      products: {
        create: [
          { name: '400 Wild Cores', skuCode: 'wr-400', priceBuy: 9000, priceSell: 10000 },
          { name: '920 Wild Cores', skuCode: 'wr-920', priceBuy: 20000, priceSell: 22000 },
          { name: '2100 Wild Cores', skuCode: 'wr-2100', priceBuy: 45000, priceSell: 49000 },
        ],
      },
    },
  })

  const codm = await prisma.game.upsert({
    where: { slug: 'cod-mobile' },
    update: {},
    create: {
      name: 'Call of Duty Mobile',
      slug: 'cod-mobile',
      iconUrl: '/images/codm-cover.png',
      products: {
        create: [
          { name: '80 CP', skuCode: 'codm-80', priceBuy: 9000, priceSell: 10500 },
          { name: '420 CP', skuCode: 'codm-420', priceBuy: 42000, priceSell: 46000 },
          { name: '880 CP', skuCode: 'codm-880', priceBuy: 80000, priceSell: 88000 },
        ],
      },
    },
  })

  const valorant = await prisma.game.upsert({
    where: { slug: 'valorant' },
    update: {},
    create: {
      name: 'Valorant',
      slug: 'valorant',
      iconUrl: '/images/valo-cover.png',
      products: {
        create: [
          { name: '475 VP', skuCode: 'valo-475', priceBuy: 45000, priceSell: 49000 },
          { name: '1000 VP', skuCode: 'valo-1000', priceBuy: 90000, priceSell: 98000 },
          { name: '2050 VP', skuCode: 'valo-2050', priceBuy: 175000, priceSell: 190000 },
        ],
      },
    },
  })

  const genshin = await prisma.game.upsert({
    where: { slug: 'genshin-impact' },
    update: {},
    create: {
      name: 'Genshin Impact',
      slug: 'genshin-impact',
      iconUrl: '/images/genshin-cover.png',
      products: {
        create: [
          { name: '60 Genesis Crystals', skuCode: 'gi-60', priceBuy: 12000, priceSell: 14000 },
          { name: '300 Genesis Crystals', skuCode: 'gi-300', priceBuy: 55000, priceSell: 60000 },
          { name: '980 Genesis Crystals', skuCode: 'gi-980', priceBuy: 165000, priceSell: 180000 },
        ],
      },
    },
  })

  const hdi = await prisma.game.upsert({
    where: { slug: 'higgs-domino' },
    update: {},
    create: {
      name: 'Higgs Domino',
      slug: 'higgs-domino',
      iconUrl: '/images/hdi-cover.png',
      products: {
        create: [
          { name: '2M Chips', skuCode: 'hdi-2m', priceBuy: 9000, priceSell: 10500 },
          { name: '5M Chips', skuCode: 'hdi-5m', priceBuy: 20000, priceSell: 23000 },
          { name: '10M Chips', skuCode: 'hdi-10m', priceBuy: 35000, priceSell: 39000 },
        ],
      },
    },
  })

  console.log('Seeded games:', mlbb.name, ff.name, pubg.name, wr.name, codm.name, valorant.name, genshin.name, hdi.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
