/**
 * FeedbackPanel Component
 * 
 * Allows users to provide feedback on MBS code recommendations and suggest alternatives
 */
import { useState } from 'react'
import type { CodeFeedback, CodeSuggestion } from '../types/api.types'
import './FeedbackPanel.css'

interface Props {
  code: string
  description: string
  onFeedbackSubmit: (feedback: CodeFeedback) => void
  onSuggestionSubmit: (suggestion: CodeSuggestion) => void
  existingFeedback?: CodeFeedback
  isExpanded?: boolean
  onToggle?: () => void
}

export function FeedbackPanel({
  code,
  description,
  onFeedbackSubmit,
  onSuggestionSubmit,
  existingFeedback,
  isExpanded = false,
  onToggle
}: Props) {
  const [rating, setRating] = useState<'positive' | 'negative' | 'neutral'>(
    existingFeedback?.rating || 'neutral'
  )
  const [comment, setComment] = useState(existingFeedback?.comment || '')
  const [shouldSuggest, setShouldSuggest] = useState(existingFeedback?.should_suggest ?? true)
  
  // Code suggestion form state
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const [suggestedCode, setSuggestedCode] = useState('')
  const [suggestionRationale, setSuggestionRationale] = useState('')
  const [suggestionConfidence, setSuggestionConfidence] = useState(3)
  const [suggestionAction, setSuggestionAction] = useState<'replace' | 'add'>('add')

  const handleFeedbackSubmit = () => {
    const feedback: CodeFeedback = {
      code,
      rating,
      comment: comment.trim() || undefined,
      timestamp: new Date().toISOString(),
      should_suggest: shouldSuggest
    }
    onFeedbackSubmit(feedback)
  }

  const handleSuggestionSubmit = () => {
    if (!suggestedCode.trim() || !suggestionRationale.trim()) {
      return
    }

    const suggestion: CodeSuggestion = {
      suggested_code: suggestedCode.trim(),
      rationale: suggestionRationale.trim(),
      confidence: suggestionConfidence,
      action: suggestionAction,
      replace_code: suggestionAction === 'replace' ? code : undefined,
      timestamp: new Date().toISOString()
    }
    
    onSuggestionSubmit(suggestion)
    
    // Reset form
    setSuggestedCode('')
    setSuggestionRationale('')
    setSuggestionConfidence(3)
    setSuggestionAction('add')
    setShowSuggestionForm(false)
  }

  const getRatingIcon = (ratingType: 'positive' | 'negative' | 'neutral'): string => {
    switch (ratingType) {
      case 'positive': return '👍'
      case 'negative': return '👎'
      case 'neutral': return '🤷'
    }
  }

  const getRatingColor = (ratingType: 'positive' | 'negative' | 'neutral'): string => {
    switch (ratingType) {
      case 'positive': return '#28a745'
      case 'negative': return '#dc3545'
      case 'neutral': return '#6c757d'
    }
  }

  if (!isExpanded) {
    return (
      <div className="feedback-panel collapsed">
        <button
          type="button"
          className="feedback-toggle"
          onClick={onToggle}
        >
          <span className="feedback-icon">💬</span>
          <span className="feedback-label">Provide Feedback</span>
          {existingFeedback && (
            <span className="feedback-status" style={{ color: getRatingColor(existingFeedback.rating) }}>
              {getRatingIcon(existingFeedback.rating)}
            </span>
          )}
          <span className="expand-icon">▶</span>
        </button>
      </div>
    )
  }

  return (
    <div className="feedback-panel expanded">
      {/* Panel Header */}
      <div className="feedback-header">
        <div className="feedback-title">
          <span className="feedback-icon">💬</span>
          <span className="feedback-text">Feedback for MBS {code}</span>
        </div>
        <div className="feedback-description" style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '4px'}}>
          {description}
        </div>
        {onToggle && (
          <button
            type="button"
            className="feedback-toggle-btn"
            onClick={onToggle}
            aria-label="Collapse feedback panel"
          >
            ▼
          </button>
        )}
      </div>

      {/* Feedback Content */}
      <div className="feedback-content">
        {/* Quick Rating */}
        <div className="feedback-section">
          <h4 className="section-title">Rate this recommendation:</h4>
          <div className="rating-buttons">
            <button
              type="button"
              className={`rating-btn positive ${rating === 'positive' ? 'active' : ''}`}
              onClick={() => setRating('positive')}
              aria-label="Good recommendation"
            >
              <span className="rating-icon">👍</span>
              <span className="rating-label">Good</span>
            </button>
            <button
              type="button"
              className={`rating-btn neutral ${rating === 'neutral' ? 'active' : ''}`}
              onClick={() => setRating('neutral')}
              aria-label="Neutral recommendation"
            >
              <span className="rating-icon">🤷</span>
              <span className="rating-label">Neutral</span>
            </button>
            <button
              type="button"
              className={`rating-btn negative ${rating === 'negative' ? 'active' : ''}`}
              onClick={() => setRating('negative')}
              aria-label="Poor recommendation"
            >
              <span className="rating-icon">👎</span>
              <span className="rating-label">Poor</span>
            </button>
          </div>
        </div>

        {/* Should Suggest Toggle */}
        <div className="feedback-section">
          <label className="suggestion-toggle">
            <input
              type="checkbox"
              checked={shouldSuggest}
              onChange={(e) => setShouldSuggest(e.target.checked)}
            />
            <span className="checkmark"></span>
            This code should be suggested for similar cases
          </label>
        </div>

        {/* Optional Comment */}
        <div className="feedback-section">
          <label htmlFor={`comment-${code}`} className="section-title">
            Additional comments (optional):
          </label>
          <textarea
            id={`comment-${code}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why was this recommendation helpful or unhelpful? What could be improved?"
            rows={3}
            className="feedback-textarea"
            maxLength={500}
          />
          <div className="char-count">
            {comment.length}/500 characters
          </div>
        </div>

        {/* Submit Feedback */}
        <div className="feedback-actions">
          <button
            type="button"
            className="submit-feedback-btn"
            onClick={handleFeedbackSubmit}
          >
            📤 Submit Feedback
          </button>
          
          <button
            type="button"
            className="suggest-code-btn"
            onClick={() => setShowSuggestionForm(!showSuggestionForm)}
          >
            {showSuggestionForm ? '❌ Cancel Suggestion' : '💡 Suggest Different Code'}
          </button>
        </div>

        {/* Code Suggestion Form */}
        {showSuggestionForm && (
          <div className="suggestion-form">
            <h4 className="section-title">Suggest an Alternative MBS Code:</h4>
            
            <div className="suggestion-fields">
              <div className="field-group">
                <label htmlFor={`suggested-code-${code}`}>MBS Code:</label>
                <input
                  id={`suggested-code-${code}`}
                  type="text"
                  value={suggestedCode}
                  onChange={(e) => setSuggestedCode(e.target.value)}
                  placeholder="e.g., 36, 44, 721"
                  className="suggestion-input"
                  maxLength={10}
                />
              </div>

              <div className="field-group">
                <label htmlFor={`rationale-${code}`}>Why is this code more appropriate?</label>
                <textarea
                  id={`rationale-${code}`}
                  value={suggestionRationale}
                  onChange={(e) => setSuggestionRationale(e.target.value)}
                  placeholder="Explain why this code better matches the consultation..."
                  rows={3}
                  className="suggestion-textarea"
                  maxLength={300}
                  required
                />
                <div className="char-count">
                  {suggestionRationale.length}/300 characters
                </div>
              </div>

              <div className="field-group">
                <label htmlFor={`confidence-${code}`}>Your confidence in this suggestion:</label>
                <select
                  id={`confidence-${code}`}
                  value={suggestionConfidence}
                  onChange={(e) => setSuggestionConfidence(Number(e.target.value))}
                  className="suggestion-select"
                >
                  <option value={1}>1 - Not very confident</option>
                  <option value={2}>2 - Somewhat confident</option>
                  <option value={3}>3 - Moderately confident</option>
                  <option value={4}>4 - Very confident</option>
                  <option value={5}>5 - Extremely confident</option>
                </select>
              </div>

              <div className="field-group">
                <label>Action:</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name={`action-${code}`}
                      value="add"
                      checked={suggestionAction === 'add'}
                      onChange={(e) => setSuggestionAction(e.target.value as 'add')}
                    />
                    Add as additional recommendation
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name={`action-${code}`}
                      value="replace"
                      checked={suggestionAction === 'replace'}
                      onChange={(e) => setSuggestionAction(e.target.value as 'replace')}
                    />
                    Replace MBS {code}
                  </label>
                </div>
              </div>
            </div>

            <div className="suggestion-actions">
              <button
                type="button"
                className="submit-suggestion-btn"
                onClick={handleSuggestionSubmit}
                disabled={!suggestedCode.trim() || !suggestionRationale.trim()}
              >
                ✅ Submit Suggestion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}