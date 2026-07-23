import express from 'express';

import Lead from '../models/Lead.js';
import requireAuth from '../middleware/requireAuth.js';
import requirePipeline from '../middleware/requirePipeline.js';

const router = express.Router();

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
    const { email, company, fullName } = req.query;
    
    let exists = false;
    
    if (email && email.trim() !== '') {
      // Primary check: exact email match
      exists = await Lead.exists({ email: email.trim().toLowerCase() });
    }
    
    if (!exists && company && company.trim() !== '') {
      // Fallback: fuzzy company name match
      // Escape regex specials just in case, but keep it flexible
      const safeCompany = company.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const companyRegex = new RegExp(safeCompany, 'i');
      
      // If fullName is also provided, check both
      if (fullName && fullName.trim() !== '') {
        const safeName = fullName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        exists = await Lead.exists({ 
          company: { $regex: companyRegex },
          fullName: { $regex: new RegExp(safeName, 'i') }
        });
      } else {
        exists = await Lead.exists({ company: { $regex: companyRegex } });
      }
    }

    return res.json({ exists: !!exists });
  } catch (err) {
    console.error('check-duplicate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/leads/cleanup-duplicates
// Temporarily added to clean up the production database
router.post('/cleanup-duplicates', requireAuth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ addedAt: 1 }); // Oldest first
    
    const keepIds = new Set();
    const deleteIds = [];
    
    // Naive memory-based deduplication
    // We will build a list of normalized strings to track what we've seen
    const seenKeys = new Set();
    
    for (const lead of leads) {
      const email = (lead.email || '').trim().toLowerCase();
      // Normalize company: remove punctuation, lowercase, remove spaces
      const company = (lead.company || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const name = (lead.fullName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      
      let isDuplicate = false;
      
      // 1. Exact Email Match
      if (email && seenKeys.has(`email:${email}`)) {
        isDuplicate = true;
      }
      
      // 2. Company + Name Match (fuzzy)
      if (company && name && seenKeys.has(`compname:${company}:${name}`)) {
        isDuplicate = true;
      }
      
      // 3. Just Company Match (if they want strict 1-lead-per-company)
      // We will assume that if company string is highly similar (after strip), it's a dup.
      if (company && seenKeys.has(`comp:${company}`)) {
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        deleteIds.push(lead._id);
      } else {
        keepIds.add(lead._id.toString());
        if (email) seenKeys.add(`email:${email}`);
        if (company && name) seenKeys.add(`compname:${company}:${name}`);
        if (company) seenKeys.add(`comp:${company}`);
      }
    }
    
    // Execute deletion
    if (deleteIds.length > 0) {
      await Lead.deleteMany({ _id: { $in: deleteIds } });
    }
    
    return res.json({ 
      success: true, 
      scanned: leads.length, 
      deleted: deleteIds.length 
    });
  } catch (err) {
    console.error('cleanup error:', err);
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

export default router;
