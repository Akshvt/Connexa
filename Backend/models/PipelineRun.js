import mongoose from 'mongoose';

const PipelineRunSchema = new mongoose.Schema({
  startedAt:    { type: Date, default: Date.now },
  completedAt:  { type: Date },
  leadsAdded:   { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  triggeredBy:  { type: String, enum: ['schedule', 'manual'], default: 'schedule' }
});

export default mongoose.model('PipelineRun', PipelineRunSchema);