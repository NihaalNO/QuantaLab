import { useState } from 'react'
import api from '../services/api'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await api.post('/contact', formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    }
  }

  if (submitted) {
    return (
      <div className="ql-page">
        <div className="ql-container max-w-2xl">
          <div className="ql-card border-accent-green/30 bg-accent-green/10">
            <div className="ql-eyebrow mb-3">Message sent</div>
            <p className="text-text-primary">Thank you. Your message has been sent to the QuantaLab team.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ql-page">
      <div className="ql-container grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <div className="ql-eyebrow mb-3">Support</div>
          <h1 className="ql-title">Contact QuantaLab</h1>
          <p className="ql-subtitle mt-4">
            Share research workflow questions, integration issues, or feedback about the quantum debugging experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ql-card-soft space-y-4">
          {error && (
            <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-mono text-sm text-accent-rose">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              className="ql-input"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="ql-input"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              required
              className="ql-input"
              value={formData.subject}
              onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="message">Message</label>
            <textarea
              id="message"
              required
              rows={6}
              className="ql-input resize-none"
              value={formData.message}
              onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            />
          </div>
          <button type="submit" className="ql-button-primary w-full sm:w-auto">
            Send message
          </button>
        </form>
      </div>
    </div>
  )
}
