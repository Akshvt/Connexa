import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './models/Lead.js';

dotenv.config();

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Remove duplicate emails (where email is not empty/null)
    const emailDuplicates = await Lead.aggregate([
      { $match: { email: { $exists: true, $ne: "", $ne: null } } },
      { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    let deletedEmailCount = 0;
    for (const group of emailDuplicates) {
      // Keep the first one, delete the rest
      const idsToDelete = group.ids.slice(1);
      await Lead.deleteMany({ _id: { $in: idsToDelete } });
      deletedEmailCount += idsToDelete.length;
    }
    console.log(`Deleted ${deletedEmailCount} duplicate leads by email.`);

    // 2. Remove duplicate companies (where email is empty/null)
    // Actually, we can just deduplicate by company globally if email is empty
    const companyDuplicates = await Lead.aggregate([
      { $match: { $or: [{ email: "" }, { email: null }, { email: { $exists: false } }] } },
      { $group: { _id: "$company", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    let deletedCompanyCount = 0;
    for (const group of companyDuplicates) {
      // Keep the first one, delete the rest
      const idsToDelete = group.ids.slice(1);
      await Lead.deleteMany({ _id: { $in: idsToDelete } });
      deletedCompanyCount += idsToDelete.length;
    }
    console.log(`Deleted ${deletedCompanyCount} duplicate leads by company (for leads with no email).`);

    console.log('Duplicate removal complete.');
  } catch (err) {
    console.error('Error removing duplicates:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeDuplicates();
