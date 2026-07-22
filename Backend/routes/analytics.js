import express from 'express';
import Lead from '../models/Lead.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/analytics/summary — protected by requireAuth
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [
      total,
      addedThisWeek,
      distinctCountries,
      contacted,
      byCountryRaw,
      byStatusRaw,
      byChannelRaw,
      byDayRaw
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ addedAt: { $gte: sevenDaysAgo } }),
      Lead.distinct('country', { country: { $ne: null, $ne: '' } }),
      Lead.countDocuments({ status: { $ne: 'new' } }),
      Lead.aggregate([
        { $match: { country: { $ne: null, $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $project: { _id: 0, country: '$_id', count: 1 } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$outreachChannel', count: { $sum: 1 } } },
        { $project: { _id: 0, channel: '$_id', count: 1 } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $match: { addedAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$addedAt' } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format byDay for the last 14 days (including days with 0 leads)
    const dayMap = {};
    byDayRaw.forEach((item) => {
      dayMap[item._id] = item.count;
    });

    const byDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      byDay.push({
        date: dateStr,
        count: dayMap[dateStr] || 0
      });
    }

    return res.json({
      total,
      addedThisWeek,
      countriesCovered: distinctCountries.length,
      contacted,
      byCountry: byCountryRaw,
      byStatus: byStatusRaw,
      byChannel: byChannelRaw,
      byDay
    });
  } catch (err) {
    console.error('GET /api/analytics/summary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
