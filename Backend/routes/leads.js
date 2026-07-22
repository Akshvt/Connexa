const express = require('express');
const router = express.Router();

const Lead = require('../models/Lead');
const requireAuth = require('../middleware/requireAuth');
const requirePipeline = require('../middleware/requirePipeline');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a Mongoose filter object from query params.
 * Shared by GET / and GET /export so filters stay consistent.
 */
function buildFilter({ search, country, status, channel }) {
  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { fullName: regex },
      { company: regex },
      { email: regex }
    ];
  }

  if (country) filter.country = country;
  if (status)  filter.status  = status;
  if (channel) filter.outreachChannel = channel;

  return filter;
}

/**
 * Escape a single CSV cell value.
 * Wraps in quotes and escapes any internal quotes.
 */
function csvCell(value) {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

// ─── Routes (order matters — specific paths before :id) ───────────────────────

// GET /api/leads/check-duplicate  — requirePipeline (Make.com)
router.get('/check-duplicate', requirePipeline, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'email query param is required' });
    }

    const exists = await Lead.exists({ email: email.trim().toLowerCase() });
    return res.json({ exists: !!exists });
  } catch (err) {
    console.error('check-duplicate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads/export  — requireAuth (JWT, frontend)
router.get('/export', requireAuth, async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const leads  = await Lead.find(filter).sort({ addedAt: -1 }).lean();

    const COLUMNS = [
      'Name', 'Company', 'Designation', 'Country', 'City',
      'Email', 'LinkedIn', 'Website', 'Channel', 'Status', 'Notes', 'Added Date'
    ];

    const rows = leads.map((l) => [
      csvCell(l.fullName),
      csvCell(l.company),
      csvCell(l.designation),
      csvCell(l.country),
      csvCell(l.city),
      csvCell(l.email),
      csvCell(l.linkedinUrl),
      csvCell(l.companyWebsite),
      csvCell(l.outreachChannel),
      csvCell(l.status),
      csvCell(l.notes),
      csvCell(l.addedAt ? new Date(l.addedAt).toLocaleDateString('en-GB') : '')
    ].join(','));

    const csv = [COLUMNS.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=namhya-leads.csv');
    return res.send(csv);
  } catch (err) {
    console.error('export error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads  — requireAuth (JWT, frontend)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = buildFilter(req.query);

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ addedAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter)
    ]);

    return res.json({
      leads,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('GET /leads error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/leads  — requirePipeline (Make.com)
router.post('/', requirePipeline, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    return res.status(201).json({ success: true, lead });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('POST /leads error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/leads/:id  — requireAuth (JWT, frontend)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (notes  !== undefined) update.notes  = notes;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json(lead);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('PUT /leads/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/leads/:id  — requireAuth (JWT, frontend)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid lead ID' });
    }
    console.error('DELETE /leads/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
