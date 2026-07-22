import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  fullName:       { type: String, default: '' },
  company:        { type: String, required: true },
  designation:    { type: String, default: '' },
  country: {
    type: String,
    enum: ['United States', 'United Kingdom', 'Canada', 'UAE', 'Australia'],
    required: true
  },
  city:           { type: String, default: '' },
  source:         { type: String, default: 'Brave Search API / Google Search' },
  email:          { type: String, default: '' },
  linkedinUrl:    { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  relevanceNote:  { type: String, default: '' },
  outreachChannel: {
    type: String,
    enum: ['Email', 'LinkedIn DM', 'WhatsApp', 'Website Contact Form'],
    default: 'Email'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'responded', 'converted', 'not_relevant'],
    default: 'new'
  },
  notes:        { type: String, default: '' },
  addedAt:      { type: Date, default: Date.now },
  lastUpdated:  { type: Date, default: Date.now }
});

LeadSchema.pre('save', async function () {
  this.lastUpdated = Date.now();
});

export default mongoose.model('Lead', LeadSchema);