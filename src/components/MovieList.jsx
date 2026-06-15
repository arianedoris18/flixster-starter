import { useEffect, useState } from 'react'
import Header from './Header'
import MovieCard from './MovieCard'

const MovieList = ({ onMovieSelect }) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [sortOption, setSortOption] = useState('')

  const fetchMovies = async (targetPage, shouldAppend = false, query = '') => {
    const apiKey = import.meta.env.VITE_API_KEY
    const trimmedQuery = query.trim()
    const endpoint = trimmedQuery
      ? 'https://api.themoviedb.org/3/search/movie'
      : 'https://api.themoviedb.org/3/movie/now_playing'
    const queryParam = trimmedQuery ? `&query=${encodeURIComponent(trimmedQuery)}` : ''

    if (shouldAppend) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(
        `${endpoint}?api_key=${apiKey}&page=${targetPage}${queryParam}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()
      setPage(data.page || targetPage)
      setTotalPages(data.total_pages || 1)
      setError(null)

      if (shouldAppend) {
        setMovies((prevMovies) => [...prevMovies, ...(data.results || [])])
      } else {
        setMovies(data.results || [])
      }
    } catch (err) {
      setError('Error fetching movies')
      console.error(err)
    } finally {
      if (shouldAppend) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchMovies(1)
  }, [])

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return
    fetchMovies(page + 1, true, activeQuery)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const nextQuery = searchQuery.trim()

    setMovies([])
    setPage(1)
    setTotalPages(1)
    setError(null)
    setActiveQuery(nextQuery)
    fetchMovies(1, false, nextQuery)
  }

  const sortedMovies = !sortOption
    ? movies
    : [...movies].sort((a, b) => {
    if (sortOption === 'vote-highest') {
      return (b.vote_average || 0) - (a.vote_average || 0)
    }

    if (sortOption === 'release-newest') {
      const firstDate = a.release_date ? new Date(a.release_date).getTime() : 0
      const secondDate = b.release_date ? new Date(b.release_date).getTime() : 0
      return secondDate - firstDate
    }

    return (a.title || '').localeCompare(b.title || '')
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <section className="movie-section">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
      <div className="movie-grid">
        {sortedMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            aveVote={movie.vote_average}
            onClick={() => onMovieSelect?.(movie.id)}
          />
        ))}
      </div>
      {page < totalPages ? (
        <button
          className="load-more-button"
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </button>
      ) : null}
    </section>
  )
}

export default MovieList