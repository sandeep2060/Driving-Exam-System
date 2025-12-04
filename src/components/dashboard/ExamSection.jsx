import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

function ExamSection({ examState, setExamState, isExamLocked, remainingDays, isVerified }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadQuestions = async () => {
    try {
      // Fetch all questions
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('No questions available in the database')
      }

      // Shuffle and take 20 random questions
      const shuffled = (data || []).sort(() => Math.random() - 0.5)
      const selectedQuestions = shuffled.slice(0, 20)
      
      if (selectedQuestions.length === 0) {
        throw new Error('No questions available')
      }
      
      setQuestions(selectedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      throw error // Re-throw to let handleStartExam handle it
    }
  }

  const handleStartExam = async () => {
    if (!isVerified) {
      alert('Your profile must be verified by an admin before you can take the exam.')
      return
    }
    
    setAnswers({})
    setLoading(true)
    
    try {
      await loadQuestions()
      // Only set examStarted to true after questions are successfully loaded
      setExamStarted(true)
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Failed to load exam questions. Please try again.')
      // Don't set examStarted if loading failed
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleExamSubmit = async (event) => {
    event.preventDefault()
    
    if (questions.length === 0) {
      alert('No questions loaded. Please try again.')
      return
    }

    setSubmitting(true)

    try {
      // Calculate score
      let correct = 0
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) {
          correct += 1
        }
      })

      const score = Math.round((correct / questions.length) * 100)
      const passed = score >= 80

      // Save exam result to database first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated. Please log in again.')
      }

      const { error: examError } = await supabase
        .from('exam_results')
        .insert({
          user_id: user.id,
          score,
          passed,
          total_questions: questions.length,
          correct_answers: correct,
          answers: answers,
          taken_at: new Date().toISOString(),
        })

      // Only update state if database save was successful
      if (examError) {
        console.error('Error saving exam result:', examError)
        throw new Error(`Failed to save exam result: ${examError.message || 'Database error'}`)
      }

      // Database save successful - now update local state
      if (passed) {
        setExamState({
          hasTakenExam: true,
          passed: true,
          score,
          failedUntil: null,
        })
      } else {
        const failedUntil = new Date()
        failedUntil.setDate(failedUntil.getDate() + 90)
        setExamState({
          hasTakenExam: true,
          passed: false,
          score,
          failedUntil: failedUntil.toISOString(),
        })
      }

      // Only reset exam state if save was successful
      setExamStarted(false)
      setAnswers({})
      setQuestions([])
    } catch (error) {
      console.error('Error submitting exam:', error)
      const errorMessage = error.message || 'Failed to submit exam. Please try again.'
      alert(`Error: ${errorMessage}\n\nYour answers have been preserved. Please try submitting again.`)
      // Don't reset exam state on error - keep questions and answers so user can retry
      // Only reset submitting state
    } finally {
      setSubmitting(false)
    }
  }

  if (!isVerified) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p className="small-text warning">
          Your profile must be verified by an administrator before you can take the exam.
          Please complete your profile and submit it for verification.
        </p>
      </div>
    )
  }

  if (!examState.passed && isExamLocked) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p className="small-text warning">
          You are not eligible to retake the exam yet. You can retake your online exam in{' '}
          {remainingDays} day{remainingDays === 1 ? '' : 's'}.
        </p>
      </div>
    )
  }

  if (examState.passed) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p className="small-text success">
          You have passed the theory exam and are eligible for the trial exam.
        </p>
        <p className="small-text">Your score: {examState.score}%</p>
      </div>
    )
  }

  // Check loading state first (before examStarted check)
  if (loading) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p>Loading questions...</p>
        <p className="small-text">Please wait while we prepare your exam.</p>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p className="small-text">
          The exam consists of 20 multiple-choice questions. You need to score at least 80% to pass.
        </p>
        <p className="small-text">
          Once you start, you must complete the exam. Make sure you have a stable internet connection.
        </p>
        <button
          type="button"
          className="primary-btn"
          onClick={handleStartExam}
          disabled={loading}
        >
          {loading ? 'Loading questions...' : 'Start Exam'}
        </button>
      </div>
    )
  }

  // Ensure we have questions before rendering the exam form
  if (questions.length === 0) {
    return (
      <div className="panel">
        <h3>Online theory exam</h3>
        <p className="small-text warning">
          No questions available. Please contact an administrator.
        </p>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            setExamStarted(false)
            setAnswers({})
            setQuestions([])
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="panel">
      <h3>Online theory exam</h3>
      <p className="small-text">
        Answer all questions. You need at least 80% to pass.
      </p>

      <form onSubmit={handleExamSubmit} className="form">
        {questions.map((q, index) => (
          <div
            key={q.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {index + 1}. {q.question}
              </p>
              {q.question_image_url && (
                <img
                  src={q.question_image_url}
                  alt="Question"
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', marginTop: '0.5rem' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['a', 'b', 'c', 'd'].map((option) => {
                const optionType = q[`option_${option}_type`] || 'text'
                const optionText = q[`option_${option}`] || ''
                const optionImageUrl = q[`option_${option}_image_url`] || ''
                
                return (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: optionType === 'text' ? 'center' : 'flex-start',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      backgroundColor: answers[q.id] === option ? '#e3f2fd' : 'transparent',
                      border: answers[q.id] === option ? '2px solid #2196f3' : '1px solid #e0e0e0',
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => handleAnswerChange(q.id, option)}
                      required
                      style={{ marginTop: optionType !== 'text' ? '0.25rem' : '0' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '500' }}>
                        {option.toUpperCase()}.{' '}
                      </span>
                      {optionType === 'text' && <span>{optionText}</span>}
                      {(optionType === 'image_url' || optionType === 'image_file') && optionImageUrl && (
                        <img
                          src={optionImageUrl}
                          alt={`Option ${option.toUpperCase()}`}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            display: 'block',
                            marginTop: '0.25rem',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="primary-btn"
            disabled={submitting || Object.keys(answers).length < questions.length}
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                setExamStarted(false)
                setAnswers({})
                setQuestions([])
              }
            }}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        <p className="small-text" style={{ marginTop: '1rem' }}>
          Answered: {Object.keys(answers).length} / {questions.length} questions
        </p>
      </form>
    </div>
  )
}

export default ExamSection
