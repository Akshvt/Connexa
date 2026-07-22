import express from 'express';
import jwt from 'jsonwebtoken';
import PipelineRun from '../models/PipelineRun.js';
import requireAuth from '../middleware/requireAuth.js';
import requirePipeline from '../middleware/requirePipeline.js';

const router = express.Router();

// Middleware allowing either x-pipeline-secret OR valid JWT Bearer token
function requireAuthOrPipeline(req, res, next) {
  const secret = req.headers['x-pipeline-secret'];
  if (secret && secret === process.env.PIPELINE_SECRET) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

// POST /api/pipeline-runs/start  — requireAuthOrPipeline
router.post('/start', requireAuthOrPipeline, async (req, res) => {
  try {
    const { triggeredBy } = req.body || {};
    const run = await PipelineRun.create({
      status: 'running',
      startedAt: new Date(),
      triggeredBy: triggeredBy === 'manual' ? 'manual' : (triggeredBy || 'schedule')
    });

    return res.status(201).json({ runId: run._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('POST /pipeline-runs/start error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pipeline-runs/complete  — requirePipeline
router.post('/complete', requirePipeline, async (req, res) => {
  try {
    const { status, leadsAdded } = req.body || {};

    const update = {
      status: status || 'completed',
      completedAt: new Date()
    };
    if (typeof leadsAdded === 'number') {
      update.leadsAdded = leadsAdded;
    }

    const run = await PipelineRun.findOneAndUpdate(
      { status: 'running' },
      update,
      { sort: { startedAt: -1 }, returnDocument: 'after', runValidators: true }
    );

    if (!run) {
      // If no 'running' instance found, create a completed record
      await PipelineRun.create({
        status: status || 'completed',
        completedAt: new Date(),
        leadsAdded: typeof leadsAdded === 'number' ? leadsAdded : 0,
        triggeredBy: 'schedule'
      });
    }

    return res.json({ success: true });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error('POST /pipeline-runs/complete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pipeline-runs  — requireAuth (JWT)
router.get('/', requireAuth, async (req, res) => {
  try {
    const runs = await PipelineRun.find()
      .sort({ startedAt: -1 })
      .limit(20)
      .lean();

    return res.json(runs);
  } catch (err) {
    console.error('GET /pipeline-runs error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pipeline-runs/latest  — requireAuth (JWT)
router.get('/latest', requireAuth, async (req, res) => {
  try {
    const run = await PipelineRun.findOne()
      .sort({ startedAt: -1 })
      .lean();

    return res.json(run || null);
  } catch (err) {
    console.error('GET /pipeline-runs/latest error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
