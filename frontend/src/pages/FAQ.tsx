export default function FAQ() {
  const faqs = [
    {
      question: "What is X-Repo?",
      answer: "X-Repo is a project repository platform that combines project management, collaboration, and community features for developers. Think of it as a place to share and discover projects."
    },
    {
      question: "How do I get started?",
      answer: "Simply create an account using email, Google, or GitHub. Then explore projects, create your own, or join a community to start learning and sharing!"
    },
    {
      question: "Do I need to have programming experience to use X-Repo?",
      answer: "Not at all! X-Repo is designed for all skill levels. Beginners can learn from tutorials and examples, while experts can share advanced projects and contribute to the community."
    },
    {
      question: "What file formats are supported for projects?",
      answer: "We support .py (Python), .js (JavaScript), .json, .md (Markdown), and standard documentation files (.txt, .pdf)."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI assistant uses Google's Gemini API to provide coding assistance, debugging help, optimization suggestions, and educational guidance."
    },
    {
      question: "Is X-Repo free to use?",
      answer: "Yes! X-Repo is completely free and open source. However, AI features may have usage limits to ensure fair access for all users."
    },
    {
      question: "Can I use X-Repo for commercial projects?",
      answer: "Yes, you can use X-Repo for both personal and commercial projects. However, please review the license terms and ensure your usage complies with the MIT License."
    },
    {
      question: "How do I report bugs or request features?",
      answer: "You can report bugs or request features through our GitHub repository issues page, or use the contact form on this website."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard security practices including Firebase Authentication, encrypted connections (HTTPS), and secure database storage. Private projects are only visible to you."
    },
    {
      question: "Can I contribute to X-Repo?",
      answer: "Absolutely! X-Repo is open source and we welcome contributions. Check out our GitHub repository for contribution guidelines and code of conduct."
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{faq.question}</h2>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
