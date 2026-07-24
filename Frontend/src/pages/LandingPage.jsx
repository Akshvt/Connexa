import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Search, Zap, Mail, GitMerge, Brain, BarChart3,
  Globe, Cpu, Bug, Settings, Database, Activity,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ShaderBackground from '../components/effects/ShaderBackground';
import { FadeUp } from '../components/effects/FadeUp';

const iconStyle = { color: 'var(--color-primary)', strokeWidth: 1.5 };

export default function LandingPage() {
  const pipelineSteps = [
    { num: '01', title: 'Trigger', desc: 'CRON scheduler initiates the pipeline at optimal regional times.\nEnsures consistent, automated daily operations.', icon: <Clock size={22} style={iconStyle} /> },
    { num: '02', title: 'Search', desc: 'Tavily/Google API executes complex semantic queries.\nIdentifies high-value distributor networks.', icon: <Search size={22} style={iconStyle} /> },
    { num: '03', title: 'Extract', desc: 'Puppeteer headless browser extracts structured contact data.\nHandles JavaScript-rendered pages and complex layouts.', icon: <Zap size={22} style={iconStyle} /> },
    { num: '04', title: 'Enrich', desc: 'Hunter.io & Apollo populate missing contact fields.\nVerifies email deliverability and professional data.', icon: <Mail size={22} style={iconStyle} /> },
    { num: '05', title: 'Dedupe', desc: 'MongoDB aggregation pipeline prevents duplicate entries.\nMaintains data integrity across all markets.', icon: <GitMerge size={22} style={iconStyle} /> },
    { num: '06', title: 'AI Relevance', desc: 'LLM analyzes context for personalized outreach.\nScores leads by strategic fit and market potential.', icon: <Brain size={22} style={iconStyle} /> },
    { num: '07', title: 'Save & Display', desc: 'Real-time sync to the Connexa dashboard.\nInstant visibility for the founder\'s office.', icon: <BarChart3 size={22} style={iconStyle} /> },
  ];

  const techStack = [
    { name: 'Tavily', role: 'Search', icon: <Globe size={28} style={iconStyle} /> },
    { name: 'Hunter.io', role: 'Email', icon: <Mail size={28} style={iconStyle} /> },
    { name: 'Groq', role: 'AI Logic', icon: <Cpu size={28} style={iconStyle} /> },
    { name: 'Puppeteer', role: 'Scraping', icon: <Bug size={28} style={iconStyle} /> },
    { name: 'Make.com', role: 'Workflow', icon: <Settings size={28} style={iconStyle} /> },
    { name: 'MongoDB', role: 'Database', icon: <Database size={28} style={iconStyle} /> },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden', color: 'var(--color-text-primary)' }}>
      <Navbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <header style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '72px', overflow: 'hidden' }}>
        {/* WebGL Shader Canvas — uses CSS class for theme-aware blend mode */}
        <div className="shader-wrapper" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0,
        }}>
          <ShaderBackground />
        </div>

        {/* Hero Content */}
        <div className="landing-hero-content" style={{ position: 'relative', zIndex: 10 }}>
          <FadeUp>
            <h1 style={{ lineHeight: 1.1 }}>
              <span style={{ opacity: 1 }}>Namhya's Pathway </span>
              <span style={{ opacity: 0.4 }}>to Global </span>
              <span style={{ color: 'var(--color-primary)' }}>Expansion.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={100}>
            <p style={{ marginTop: '32px', maxWidth: '640px', fontSize: '18px', lineHeight: '28px', color: 'var(--color-text-secondary)' }}>
              Connexa — Where Namhya's Ayurvedic Wisdom Finds Its Next Home. Automated lead generation bridging ancient wellness with modern operational efficiency.
            </p>
          </FadeUp>

          <FadeUp delay={200}>
            <div className="landing-hero-cta">
              <Link to="/login">
                <button style={{
                  backgroundColor: 'var(--color-primary)', color: '#FFFFFF',
                  padding: '16px 32px', borderRadius: '999px', border: 'none',
                  fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: 'var(--landing-primary-glow)',
                }}>Get Started</button>
              </Link>
              <Link to="/docs">
                <button style={{
                  background: 'var(--landing-btn-secondary-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--landing-btn-secondary-border)',
                  borderRadius: '999px',
                  padding: '16px 32px', color: 'var(--color-text-primary)',
                  fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                }}>View Documentation</button>
              </Link>
            </div>
          </FadeUp>

          {/* Stats glass card */}
          <FadeUp delay={400}>
            <div style={{
              marginTop: '96px',
              background: 'var(--landing-glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--landing-glass-border)',
              borderRadius: '24px',
              boxShadow: 'var(--landing-glass-glow)',
              padding: '32px', display: 'flex', alignItems: 'center', gap: '24px',
              maxWidth: '480px', width: '100%',
              transition: 'transform 0.5s ease',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--landing-icon-bg)',
                border: '1px solid var(--landing-icon-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Activity size={24} style={iconStyle} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>50+ Verified Leads</div>
                <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>Discovered across 5 new global markets today.</div>
              </div>
            </div>
          </FadeUp>
        </div>
      </header>

      {/* ═══════════════ HOW IT WORKS — Vertical Timeline ═══════════════ */}
      <section id="how-it-works" className="landing-section" style={{ position: 'relative', zIndex: 10, backgroundColor: 'var(--color-bg)' }}>
        <div className="landing-section-content" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '24px' }}>Technical Architecture</h2>
              <p style={{ fontSize: '18px', lineHeight: '28px', maxWidth: '640px', margin: '0 auto' }}>The automated pipeline powering systematic global outreach.</p>
            </div>
          </FadeUp>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              display: 'none', position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: '1px', backgroundColor: 'var(--landing-glass-border)', transform: 'translateX(-50%)',
            }} className="timeline-line" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {pipelineSteps.map((step, idx) => (
                <FadeUp key={idx} delay={idx * 80}>
                  <div className="landing-timeline-step" style={{
                    flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  }}>
                    {/* Card side */}
                    <div className="landing-timeline-card-wrapper">
                      <div style={{
                        background: 'var(--landing-glass-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--landing-glass-border)',
                        borderRadius: '24px',
                        padding: '24px', transition: 'background 0.3s ease',
                        textAlign: idx % 2 === 0 ? 'right' : 'left',
                      }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                          {step.num}. {step.title}
                        </h3>
                        <p style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>{step.desc}</p>
                      </div>
                    </div>

                    {/* Center icon */}
                    <div className="landing-timeline-icon" style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--color-bg)',
                      border: '1px solid var(--landing-icon-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10,
                      boxShadow: 'var(--shadow-card)',
                      transition: 'border-color 0.3s ease',
                    }}>{step.icon}</div>

                    {/* Empty side */}
                    <div className="landing-timeline-spacer" />
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TECH STACK ═══════════════ */}
      <section className="landing-section" style={{
        backgroundColor: 'var(--color-bg-elevated)',
        borderTop: '1px solid var(--landing-glass-border)',
        position: 'relative', zIndex: 10,
      }}>
        <div className="landing-section-content" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <FadeUp>
            <h2 style={{ fontSize: '40px', fontWeight: 600, letterSpacing: '-0.01em', textAlign: 'center', marginBottom: '48px' }}>Technology Stack</h2>
          </FadeUp>

          <FadeUp delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px' }}>
              {techStack.map((item, idx) => (
                <div key={idx} style={{
                  background: 'var(--landing-glass-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--landing-glass-border)',
                  borderRadius: '24px',
                  padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ marginBottom: '16px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{item.role}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
