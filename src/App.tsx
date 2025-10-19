import { useState } from 'react'
import { Search, ThumbsUp, Bookmark, Share2, ExternalLink, Loader, Home } from 'lucide-react'

interface News {
  id: string
  title: string
  summary: string
  source: string
  author: string
  url: string
}

function App() {
  const [page, setPage] = useState<'home' | 'saved'>('home')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState('')
  const [dateRange, setDateRange] = useState('7d')
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<Map<string, News>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState('')

  const BACKEND_URL = 'https://newsaggregatorbackend-production.up.railway.app'

  const fetchNews = async () => {
    if (!search.trim()) {
      setError('Please enter a search term')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: search,
          language,
          category: category || '',
          dateRange: dateRange === '24h' ? '1d' : dateRange,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch news')

      const data = await response.json()
      const formatted = data.news.map((item: any, idx: number) => ({
        id: `${item.url}-${idx}`,
        title: item.title,
        summary: item.summary
          .replace(/^(Elbette|Here's?|Here is)[^.!?]*[.!?]\s*/i, '')
          .trim(),
        source: item.source,
        author: item.author,
        url: item.url,
      }))
      setNews(formatted)
      setCurrentIndex(0)
    } catch (err) {
      setError('Error fetching news. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (id: string) => {
    const newLiked = new Set(liked)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLiked(newLiked)
  }

  const toggleBookmark = (article: News) => {
    const newBookmarks = new Map(bookmarks)
    if (newBookmarks.has(article.id)) {
      newBookmarks.delete(article.id)
    } else {
      newBookmarks.set(article.id, article)
    }
    setBookmarks(newBookmarks)
  }

  const handleShare = (article: News) => {
    navigator.clipboard.writeText(`${article.title}\n${article.url}`)
  }

  const savedArticles = Array.from(bookmarks.values())

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-blue-900/30 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">N</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">News Aggregator</h1>
              </div>
              <p className="text-slate-400">Powered by AI</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage('home')}
                className={`p-2 rounded-lg transition ${
                  page === 'home' ? 'bg-blue-600' : 'bg-slate-700/50 hover:bg-slate-600/50'
                }`}
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage('saved')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  page === 'saved'
                    ? 'bg-yellow-600'
                    : 'bg-slate-700/50 hover:bg-slate-600/50'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="text-sm">{bookmarks.size}</span>
              </button>
            </div>
          </div>

          {page === 'home' && (
            <>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search news topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchNews()}
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  onClick={fetchNews}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {loading ? 'Searching' : 'Search'}
                </button>
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="de">Deutsch</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="sports">Sports</option>
                  <option value="health">Health</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="science">Science</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {page === 'home' && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {news.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📰</div>
                <p className="text-xl text-slate-400">Search to get started!</p>
              </div>
            )}

            {news.length > 0 && (
              <div className="space-y-6">
                <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-xl p-8 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition duration-300">
                  <div className="text-sm text-slate-500 mb-3">Article {currentIndex + 1} of {news.length}</div>

                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition">
                    {news[currentIndex].title}
                  </h3>

                  <p className="text-slate-300 text-base mb-6 leading-relaxed">
                    {news[currentIndex].summary}
                  </p>

                  <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                    <span className="bg-blue-500/20 px-3 py-1 rounded border border-blue-500/30">
                      {news[currentIndex].source}
                    </span>
                    {news[currentIndex].author && <span>{news[currentIndex].author}</span>}
                  </div>

                  <div className="flex gap-2 flex-wrap mb-6">
                    <button
                      onClick={() => toggleLike(news[currentIndex].id)}
                      className={`p-2 rounded-lg transition ${
                        liked.has(news[currentIndex].id)
                          ? 'bg-green-500/30 border border-green-500/50 text-green-400'
                          : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleBookmark(news[currentIndex])}
                      className={`p-2 rounded-lg transition ${
                        bookmarks.has(news[currentIndex].id)
                          ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-400'
                          : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(news[currentIndex])}
                      className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <a
                      href={news[currentIndex].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gradient-to-r from-blue-600/50 to-cyan-600/50 border border-blue-500/50 text-blue-200 hover:from-blue-600 hover:to-cyan-600 transition ml-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-slate-700">
                    <button
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={() => setCurrentIndex(Math.min(news.length - 1, currentIndex + 1))}
                      disabled={currentIndex === news.length - 1}
                      className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition ml-auto"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {page === 'saved' && (
          <>
            <h2 className="text-3xl font-bold mb-6">Saved Articles ({savedArticles.length})</h2>
            {savedArticles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No saved articles yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedArticles.map((article) => (
                  <div key={article.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/50 transition">
                    <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{article.summary}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">{article.source}</span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        Read <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => toggleBookmark(article)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App