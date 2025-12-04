import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

function QuestionManagement() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    question_image_url: '',
    option_a: '',
    option_a_type: 'text',
    option_a_image_url: '',
    option_b: '',
    option_b_type: 'text',
    option_b_image_url: '',
    option_c: '',
    option_c_type: 'text',
    option_c_image_url: '',
    option_d: '',
    option_d_type: 'text',
    option_d_image_url: '',
    correct_answer: 'a',
    explanation: '',
  })
  const [uploading, setUploading] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Load error:', error)
        throw error
      }
      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to load questions: ${error.message || 'Unknown error'}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file, optionKey) => {
    if (!file) return null

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file must be smaller than 5MB' })
      return null
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File must be an image' })
      return null
    }

    setUploading({ ...uploading, [optionKey]: true })
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `exam-images/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exam-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use public URL
        console.error('Upload error:', uploadError)
        // For now, we'll use a data URL as fallback
        return await fileToDataURL(file)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exam-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      // Fallback to data URL
      return await fileToDataURL(file)
    } finally {
      setUploading({ ...uploading, [optionKey]: false })
    }
  }

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e, optionKey) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = await handleImageUpload(file, optionKey)
    if (imageUrl) {
      setFormData({
        ...formData,
        [`${optionKey}_image_url`]: imageUrl,
        [`${optionKey}_type`]: 'image_file',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    const options = ['a', 'b', 'c', 'd']
    for (const opt of options) {
      const type = formData[`option_${opt}_type`]
      if (type === 'text' && !formData[`option_${opt}`].trim()) {
        setMessage({ type: 'error', text: `Option ${opt.toUpperCase()} is required` })
        return
      }
      if ((type === 'image_url' || type === 'image_file') && !formData[`option_${opt}_image_url`].trim()) {
        setMessage({ type: 'error', text: `Option ${opt.toUpperCase()} image is required` })
        return
      }
    }

    if (!formData.question.trim()) {
      setMessage({ type: 'error', text: 'Question is required' })
      return
    }

    try {
      const questionData = {
        question: formData.question.trim(),
        question_image_url: formData.question_image_url.trim() || null,
        option_a: formData.option_a_type === 'text' ? formData.option_a.trim() : null,
        option_a_type: formData.option_a_type,
        option_a_image_url: (formData.option_a_type === 'image_url' || formData.option_a_type === 'image_file') 
          ? formData.option_a_image_url.trim() : null,
        option_b: formData.option_b_type === 'text' ? formData.option_b.trim() : null,
        option_b_type: formData.option_b_type,
        option_b_image_url: (formData.option_b_type === 'image_url' || formData.option_b_type === 'image_file') 
          ? formData.option_b_image_url.trim() : null,
        option_c: formData.option_c_type === 'text' ? formData.option_c.trim() : null,
        option_c_type: formData.option_c_type,
        option_c_image_url: (formData.option_c_type === 'image_url' || formData.option_c_type === 'image_file') 
          ? formData.option_c_image_url.trim() : null,
        option_d: formData.option_d_type === 'text' ? formData.option_d.trim() : null,
        option_d_type: formData.option_d_type,
        option_d_image_url: (formData.option_d_type === 'image_url' || formData.option_d_type === 'image_file') 
          ? formData.option_d_image_url.trim() : null,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation.trim() || null,
      }

      if (editingQuestion) {
        questionData.updated_at = new Date().toISOString()
        const { error } = await supabase
          .from('exam_questions')
          .update(questionData)
          .eq('id', editingQuestion.id)

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        setMessage({ type: 'success', text: 'Question updated successfully!' })
      } else {
        const { error } = await supabase
          .from('exam_questions')
          .insert(questionData)

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        setMessage({ type: 'success', text: 'Question added successfully!' })
      }

      // Reset form
      setFormData({
        question: '',
        question_image_url: '',
        option_a: '',
        option_a_type: 'text',
        option_a_image_url: '',
        option_b: '',
        option_b_type: 'text',
        option_b_image_url: '',
        option_c: '',
        option_c_type: 'text',
        option_c_image_url: '',
        option_d: '',
        option_d_type: 'text',
        option_d_image_url: '',
        correct_answer: 'a',
        explanation: '',
      })
      setEditingQuestion(null)
      setShowForm(false)
      loadQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to save question: ${error.message || 'Unknown error. Check console for details.'}` 
      })
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question || '',
      question_image_url: question.question_image_url || '',
      option_a: question.option_a || '',
      option_a_type: question.option_a_type || 'text',
      option_a_image_url: question.option_a_image_url || '',
      option_b: question.option_b || '',
      option_b_type: question.option_b_type || 'text',
      option_b_image_url: question.option_b_image_url || '',
      option_c: question.option_c || '',
      option_c_type: question.option_c_type || 'text',
      option_c_image_url: question.option_c_image_url || '',
      option_d: question.option_d || '',
      option_d_type: question.option_d_type || 'text',
      option_d_image_url: question.option_d_image_url || '',
      correct_answer: question.correct_answer || 'a',
      explanation: question.explanation || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Question deleted successfully!' })
      loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      setMessage({ type: 'error', text: `Failed to delete question: ${error.message}` })
    }
  }

  const handleCancel = () => {
    setFormData({
      question: '',
      question_image_url: '',
      option_a: '',
      option_a_type: 'text',
      option_a_image_url: '',
      option_b: '',
      option_b_type: 'text',
      option_b_image_url: '',
      option_c: '',
      option_c_type: 'text',
      option_c_image_url: '',
      option_d: '',
      option_d_type: 'text',
      option_d_image_url: '',
      correct_answer: 'a',
      explanation: '',
    })
    setEditingQuestion(null)
    setShowForm(false)
    setMessage({ type: '', text: '' })
  }

  const renderOptionInput = (optionKey) => {
    const type = formData[`${optionKey}_type`]
    const label = optionKey.toUpperCase()

    return (
      <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <strong>Option {label} *</strong>
          <select
            value={type}
            onChange={(e) => {
              setFormData({ ...formData, [`${optionKey}_type`]: e.target.value })
            }}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            <option value="text">Text</option>
            <option value="image_url">Image URL</option>
            <option value="image_file">Upload Image</option>
          </select>
        </div>

        {type === 'text' && (
          <input
            type="text"
            value={formData[optionKey]}
            onChange={(e) => setFormData({ ...formData, [optionKey]: e.target.value })}
            placeholder={`Option ${label} text`}
            required={type === 'text'}
          />
        )}

        {type === 'image_url' && (
          <div>
            <input
              type="url"
              value={formData[`${optionKey}_image_url`]}
              onChange={(e) => setFormData({ ...formData, [`${optionKey}_image_url`]: e.target.value })}
              placeholder="Enter image URL"
              required
            />
            {formData[`${optionKey}_image_url`] && (
              <img
                src={formData[`${optionKey}_image_url`]}
                alt={`Option ${label} preview`}
                style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '0.5rem', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
          </div>
        )}

        {type === 'image_file' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, optionKey)}
              disabled={uploading[optionKey]}
            />
            {uploading[optionKey] && <p className="small-text">Uploading...</p>}
            {formData[`${optionKey}_image_url`] && (
              <img
                src={formData[`${optionKey}_image_url`]}
                alt={`Option ${label} preview`}
                style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '0.5rem', display: 'block' }}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="panel"><p>Loading questions...</p></div>
  }

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Exam Question Management</h3>
          <p className="small-text">Add, edit, and manage exam questions (supports text, image URL, or image upload)</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setShowForm(true)
            setEditingQuestion(null)
            setFormData({
              question: '',
              question_image_url: '',
              option_a: '',
              option_a_type: 'text',
              option_a_image_url: '',
              option_b: '',
              option_b_type: 'text',
              option_b_image_url: '',
              option_c: '',
              option_c_type: 'text',
              option_c_image_url: '',
              option_d: '',
              option_d_type: 'text',
              option_d_image_url: '',
              correct_answer: 'a',
              explanation: '',
            })
          }}
        >
          + Add New Question
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'status error' : 'status success'} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div style={{ 
          border: '2px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          backgroundColor: '#f9f9f9'
        }}>
          <h4 style={{ marginBottom: '1rem' }}>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h4>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Question *
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
                rows={3}
                required
                style={{ fontFamily: 'inherit' }}
              />
            </label>

            <label>
              Question Image URL (optional)
              <input
                type="url"
                value={formData.question_image_url}
                onChange={(e) => setFormData({ ...formData, question_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {formData.question_image_url && (
                <img
                  src={formData.question_image_url}
                  alt="Question preview"
                  style={{ maxWidth: '300px', maxHeight: '300px', marginTop: '0.5rem', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
            </label>

            {renderOptionInput('option_a')}
            {renderOptionInput('option_b')}
            {renderOptionInput('option_c')}
            {renderOptionInput('option_d')}

            <label>
              Correct Answer *
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                required
              >
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
              </select>
            </label>

            <label>
              Explanation (optional)
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explanation for the correct answer"
                rows={2}
                style={{ fontFamily: 'inherit' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="primary-btn" disabled={Object.values(uploading).some(v => v)}>
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              <button type="button" className="secondary-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h4 style={{ marginBottom: '1rem' }}>
          All Questions ({questions.length})
        </h4>
        {questions.length === 0 ? (
          <p>No questions added yet. Click "Add New Question" to get started.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q) => (
              <div
                key={q.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <strong>{q.question}</strong>
                    {q.question_image_url && (
                      <img
                        src={q.question_image_url}
                        alt="Question"
                        style={{ maxWidth: '300px', maxHeight: '300px', marginTop: '0.5rem', display: 'block' }}
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="secondary-outline-btn small"
                      onClick={() => handleEdit(q)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-outline-btn small"
                      onClick={() => handleDelete(q.id)}
                      style={{ color: '#dc3545' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const type = q[`option_${opt}_type`] || 'text'
                    const isCorrect = q.correct_answer === opt
                    return (
                      <div key={opt} style={{ padding: '0.5rem', backgroundColor: isCorrect ? '#e8f5e9' : '#f5f5f5', borderRadius: '4px' }}>
                        <strong>{opt.toUpperCase()}. </strong>
                        {type === 'text' && <span>{q[`option_${opt}`]} {isCorrect && '✓'}</span>}
                        {(type === 'image_url' || type === 'image_file') && q[`option_${opt}_image_url`] && (
                          <div>
                            <img
                              src={q[`option_${opt}_image_url`]}
                              alt={`Option ${opt.toUpperCase()}`}
                              style={{ maxWidth: '150px', maxHeight: '150px', display: 'block', marginTop: '0.25rem' }}
                            />
                            {isCorrect && <span> ✓</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e8f5e9', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionManagement
