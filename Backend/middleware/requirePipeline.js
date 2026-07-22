module.exports = function requirePipeline(req, res, next) {
  const secret = req.headers['x-pipeline-secret'];

  if (!secret || secret !== process.env.PIPELINE_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
