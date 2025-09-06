import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  spring,
} from 'remotion';

interface AutoMBSMarketingClipProps {
  title: string;
  subtitle: string;
}

// Modern color palette
const colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  dark: '#0f172a',
  lightBg: '#f8fafc',
  text: '#1e293b',
  textLight: '#64748b',
};

// Mock UI components based on the actual app
const MockHeader: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 40,
    opacity,
    borderBottom: '1px solid #e2e8f0',
  }}>
    <div>
      <h1 style={{
        fontSize: 24,
        fontWeight: 700,
        color: colors.text,
        margin: 0,
        marginBottom: 4,
      }}>
        MBS Coding Assistant
      </h1>
      <p style={{
        fontSize: 14,
        color: colors.textLight,
        margin: 0,
      }}>
        AI-Powered Medicare Benefits Schedule Code Recommendations
      </p>
    </div>
    <div style={{
      marginLeft: 'auto',
      marginRight: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors.success,
      }} />
      <span style={{ fontSize: 12, color: colors.textLight }}>Live API Connection</span>
    </div>
  </div>
);

const MockTextInput: React.FC<{ 
  opacity: number; 
  text: string;
  showTyping?: boolean;
}> = ({ opacity, text, showTyping }) => (
  <div style={{
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    opacity,
  }}>
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
    }}>
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        color: colors.text,
        margin: 0,
        marginBottom: 8,
      }}>
        Consultation Note Analysis
      </h2>
      <p style={{
        fontSize: 14,
        color: colors.textLight,
        margin: 0,
        marginBottom: 16,
      }}>
        Enter a consultation note and select the appropriate context to receive AI-powered MBS code recommendations.
      </p>
      
      {/* Context Selector */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <label style={{
          fontSize: 14,
          fontWeight: 500,
          color: colors.text,
        }}>
          Context:
        </label>
        <div style={{
          background: colors.lightBg,
          border: `1px solid ${colors.primary}`,
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 14,
          color: colors.primary,
          fontWeight: 500,
        }}>
          General Practice
        </div>
      </div>

      {/* Textarea */}
      <div style={{
        border: `2px solid ${colors.primary}`,
        borderRadius: 8,
        padding: 16,
        background: colors.lightBg,
        minHeight: 120,
        fontFamily: 'monospace',
        fontSize: 14,
        color: colors.text,
        lineHeight: 1.5,
      }}>
        {showTyping ? text : ''}
      </div>

      {/* Character count */}
      <div style={{
        fontSize: 12,
        color: colors.textLight,
        marginTop: 8,
        textAlign: 'right',
      }}>
        {text.length}/10,000 characters
      </div>

      {/* Analyze button */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        gap: 12,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          Analyze Consultation
        </div>
        <div style={{
          border: '1px solid #d1d5db',
          color: colors.textLight,
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 14,
          fontWeight: 500,
        }}>
          Clear
        </div>
      </div>
    </div>
  </div>
);

const MockResultsCard: React.FC<{ 
  opacity: number;
  code: string;
  description: string;
  confidence: number;
  fee: string;
  rank: number;
  delay?: number;
}> = ({ opacity, code, description, confidence, fee, rank, delay = 0 }) => {
  const frame = useCurrentFrame();
  const slideIn = spring({
    frame: frame - delay,
    fps: 30,
    from: 50,
    to: 0,
    durationInFrames: 20,
  });

  const confidenceColor = confidence >= 80 ? colors.success : 
                         confidence >= 60 ? colors.warning : colors.error;

  return (
    <div style={{
      opacity,
      transform: `translateY(${slideIn}px)`,
      background: 'white',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginBottom: 12,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        {/* Rank badge */}
        <div style={{
          background: colors.primary,
          color: 'white',
          borderRadius: 20,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
        }}>
          #{rank}
        </div>

        {/* Code info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
            }}>
              {code}
            </span>
            <span style={{
              background: colors.lightBg,
              color: colors.textLight,
              fontSize: 12,
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              Cat 1
            </span>
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 500,
            color: colors.text,
            margin: 0,
            marginBottom: 12,
            lineHeight: 1.4,
          }}>
            {description}
          </h3>
          
          {/* Confidence bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}>
            <div style={{
              flex: 1,
              height: 6,
              background: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${confidence}%`,
                height: '100%',
                background: confidenceColor,
                borderRadius: 3,
              }} />
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: confidenceColor,
            }}>
              {confidence}%
            </span>
          </div>

          {/* Fee */}
          <div style={{
            fontSize: 14,
            color: colors.text,
          }}>
            <span style={{ color: colors.textLight }}>Schedule Fee: </span>
            <span style={{ fontWeight: 600 }}>{fee}</span>
          </div>
        </div>

        {/* Confidence circle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: `3px solid ${confidenceColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${confidenceColor}15`,
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: confidenceColor,
            }}>
              {confidence}%
            </span>
          </div>
          <span style={{
            fontSize: 10,
            color: colors.textLight,
          }}>
            Confidence
          </span>
        </div>
      </div>
    </div>
  );
};

// Title slide component
const TitleSlide: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  
  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
  const titleScale = interpolate(frame, [0, 30], [0.8, 1]);
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1]);
  const logoOpacity = interpolate(frame, [10, 40], [0, 1]);

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Logo */}
      <div style={{
        opacity: logoOpacity,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
      }}>
        <span style={{ fontSize: 80 }}>🏥</span>
        <span style={{
          fontSize: 64,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AutoMBS
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 56,
        fontWeight: 700,
        color: 'white',
        textAlign: 'center',
        margin: 0,
        marginBottom: 20,
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        lineHeight: 1.2,
      }}>
        {title}
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 24,
        color: '#94a3b8',
        textAlign: 'center',
        margin: 0,
        opacity: subtitleOpacity,
      }}>
        {subtitle}
      </p>
    </AbsoluteFill>
  );
};

// Problem slide
const ProblemSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 60,
        maxWidth: 1000,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 30,
        }}>
          The Medicare Billing Challenge
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 30,
          marginTop: 40,
        }}>
          {[
            { icon: '⏱️', title: '15-20 min', desc: 'per consultation to find correct MBS codes' },
            { icon: '❌', title: '30-80%', desc: 'error rate in manual billing submissions' },
            { icon: '💰', title: '$25', desc: 'cost per rejected claim resubmission' },
            { icon: '📚', title: '5,964', desc: 'different MBS codes to choose from' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: colors.lightBg,
              borderRadius: 12,
              padding: 24,
              border: '2px solid #ef4444',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#dc2626',
                marginBottom: 8,
              }}>
                {stat.title}
              </div>
              <p style={{
                fontSize: 14,
                color: colors.textLight,
                margin: 0,
              }}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Demo slide showing UI in action
const UIInActionSlide: React.FC = () => {
  const frame = useCurrentFrame();
  
  const headerOpacity = interpolate(frame, [0, 20], [0, 1]);
  const inputOpacity = interpolate(frame, [20, 40], [0, 1]);
  
  // Typing animation
  const typingProgress = Math.min((frame - 60) / 60, 1);
  const consultationText = "45-year-old patient presents with persistent cough lasting 3 weeks, accompanied by chest tightness. Comprehensive physical examination performed including chest auscultation, vital signs assessment, and detailed history taking. Patient education provided regarding respiratory health and follow-up recommendations discussed.";
  const displayText = consultationText.substring(0, Math.floor(typingProgress * consultationText.length));
  const showTyping = frame >= 60 && frame < 120;

  return (
    <AbsoluteFill style={{
      background: colors.lightBg,
    }}>
      <MockHeader opacity={headerOpacity} />
      <MockTextInput 
        opacity={inputOpacity} 
        text={displayText}
        showTyping={showTyping}
      />
      
      {/* Processing indicator */}
      {frame >= 140 && frame < 180 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: 12,
          padding: 30,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 24,
            height: 24,
            border: `3px solid ${colors.primary}`,
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: colors.text,
            }}>
              Analyzing consultation note...
            </div>
            <div style={{
              fontSize: 12,
              color: colors.textLight,
            }}>
              AI processing in progress
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Results slide
const ResultsSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill style={{
      background: colors.lightBg,
      opacity,
    }}>
      <MockHeader opacity={1} />
      
      {/* Results header */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 40,
        right: 40,
      }}>
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            marginBottom: 8,
          }}>
            MBS Code Recommendations
          </h2>
          <p style={{
            fontSize: 14,
            color: colors.textLight,
            margin: 0,
            marginBottom: 16,
          }}>
            Found 3 high-confidence recommendations • Processed in 1.2 seconds
          </p>
          
          <div style={{
            display: 'flex',
            gap: 20,
            fontSize: 12,
            color: colors.textLight,
          }}>
            <span>Model: GPT-4o-mini</span>
            <span>Category: General Practice Consultation</span>
            <span>Context: Standard Visit</span>
          </div>
        </div>

        {/* Results cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <MockResultsCard
            opacity={frame >= 30 ? 1 : 0}
            code="36"
            description="Level C consultation (45+ minutes) - Comprehensive assessment and management"
            confidence={96}
            fee="$88.20"
            rank={1}
            delay={30}
          />
          <MockResultsCard
            opacity={frame >= 45 ? 1 : 0}
            code="2517"
            description="Patient education for chronic disease management and self-care"
            confidence={89}
            fee="$41.40"
            rank={2}
            delay={45}
          />
          <MockResultsCard
            opacity={frame >= 60 ? 1 : 0}
            code="11"
            description="Standard consultation with examination and treatment plan"
            confidence={76}
            fee="$41.40"
            rank={3}
            delay={60}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// CTA slide
const CTASlide: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.9, 1]);

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 700,
          marginBottom: 20,
        }}>
          Ready to Transform Your Practice?
        </h2>
        <p style={{
          fontSize: 20,
          color: '#94a3b8',
          marginBottom: 40,
        }}>
          Join the AI revolution in healthcare billing
        </p>
        
        <div style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            color: 'white',
            borderRadius: 8,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 600,
          }}>
            Try AutoMBS Free
          </div>
          <div style={{
            border: '2px solid #475569',
            color: '#94a3b8',
            borderRadius: 8,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 500,
          }}>
            Learn More
          </div>
        </div>

        <div style={{
          marginTop: 40,
          fontSize: 14,
          color: '#64748b',
        }}>
          🏆 AI NextGen Challenge Winner • 🚀 Deploy in Minutes • 💡 99% Test Coverage
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AutoMBSMarketingClip: React.FC<AutoMBSMarketingClipProps> = ({
  title,
  subtitle,
}) => {
  return (
    <AbsoluteFill>
      {/* Title slide - 0-3 seconds */}
      <Sequence from={0} durationInFrames={90}>
        <TitleSlide title={title} subtitle={subtitle} />
      </Sequence>

      {/* Problem slide - 3-6 seconds */}
      <Sequence from={90} durationInFrames={90}>
        <ProblemSlide />
      </Sequence>

      {/* UI Demo slide - 6-12 seconds */}
      <Sequence from={180} durationInFrames={180}>
        <UIInActionSlide />
      </Sequence>

      {/* Results slide - 12-18 seconds */}
      <Sequence from={360} durationInFrames={180}>
        <ResultsSlide />
      </Sequence>

      {/* CTA slide - 18-30 seconds */}
      <Sequence from={540} durationInFrames={360}>
        <CTASlide />
      </Sequence>
    </AbsoluteFill>
  );
};