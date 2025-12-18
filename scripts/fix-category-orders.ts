import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function fixCategoryOrders() {
  try {
    // Get all categories ordered by createdAt
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, order: true },
    });

    console.log(`Found ${categories.length} categories`);
    console.log('Current orders:', categories.map(c => ({ name: c.name, order: c.order })));

    // Update order values sequentially
    for (let i = 0; i < categories.length; i++) {
      await prisma.category.update({
        where: { id: categories[i].id },
        data: { order: i },
      });
      console.log(`Updated ${categories[i].name} to order ${i}`);
    }

    console.log('✅ All category orders updated successfully!');
  } catch (error) {
    console.error('Error fixing category orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryOrders();

