import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import Header from './Header'
import MovieCard from './MovieCard'

const API_KEY = import.meta.env.VITE_API_KEY
const NOW_PLAYING_URL = 'https://api.themoviedb.org/3/movie/now_playing'
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'

const shuffleMovies = (movieList) => {
  const shuffled = [...movieList]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

const MovieList = ({ onMovieSelect }) => {
  const [movies, setMovies] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [sortOption, setSortOption] = useState('')
  const [viewMode, setViewMode] = useState('all')
  const [favoriteIds, setFavoriteIds] = useState([])
  const [watchedIds, setWatchedIds] = useState([])
  const [movieLookup, setMovieLookup] = useState({})

  const requestIdRef = useRef(0)
  const inflightControllerRef = useRef(null)
  const loadingMoreRef = useRef(false)

  const fetchMovies = async (targetPage, shouldAppend, query) => {
    const trimmedQuery = query.trim()
    const endpoint = trimmedQuery ? SEARCH_URL : NOW_PLAYING_URL

    if (inflightControllerRef.current) inflightControllerRef.current.abort()
    const controller = new AbortController()
    inflightControllerRef.current = controller

    requestIdRef.current += 1
    const requestId = requestIdRef.current

    if (shouldAppend) {
      loadingMoreRef.current = true
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await axios.get(endpoint, {
        signal: controller.signal,
        params: {
          api_key: API_KEY,
          page: targetPage,
          ...(trimmedQuery ? { query: trimmedQuery } : {}),
        },
      })

      if (requestId !== requestIdRef.current) return

      const data = response.data
      const results = data.results || []
      setMovieLookup((prev) => {
        const next = { ...prev }
        results.forEach((movie) => {
          next[movie.id] = {
            id: movie.id,
            title: movie.title || 'Untitled',
            poster_path: movie.poster_path || null,
            vote_average: movie.vote_average || 0,
          }
        })
        return next
      })
      setPage(data.page || targetPage)
      setTotalPages(data.total_pages || 1)
      setError(null)

      if (shouldAppend) {
        setMovies((prev) => [...prev, ...results])
      } else {
        const ordered = trimmedQuery ? results : shuffleMovies(results)
        setMovies(ordered)
        if (!trimmedQuery && ordered.length > 0) setFeaturedMovie(ordered[0])
        if (trimmedQuery) setFeaturedMovie(null)
      }
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') return
      if (requestId !== requestIdRef.current) return
      setError('Error fetching movies. Please try again.')
      console.error(err)
    } finally {
      if (requestId === requestIdRef.current) {
        if (shouldAppend) {
          loadingMoreRef.current = false
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    }
  }

  useEffect(() => {
    fetchMovies(1, false, '')
    return () => {
      if (inflightControllerRef.current) inflightControllerRef.current.abort()
    }
  }, [])

  const handleLoadMore = () => {
    if (loadingMoreRef.current || page >= totalPages) return
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

  const handleClearSearch = () => {
    if (!activeQuery && !searchQuery) return
    setSearchQuery('')
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setError(null)
    setActiveQuery('')
    fetchMovies(1, false, '')
  }

  const handleRetry = () => {
    setError(null)
    fetchMovies(1, false, activeQuery)
  }

  const handleGetDescription = () => {
    if (!heroMovie?.id) return
    onMovieSelect?.(heroMovie.id)
  }

  const handleToggleFavorite = (movie) => {
    setMovieLookup((prev) => ({
      ...prev,
      [movie.id]: {
        id: movie.id,
        title: movie.title || 'Untitled',
        poster_path: movie.poster_path || null,
        vote_average: movie.vote_average || 0,
      },
    }))
    setFavoriteIds((prev) =>
      prev.includes(movie.id) ? prev.filter((movieId) => movieId !== movie.id) : [...prev, movie.id]
    )
  }

  const handleToggleWatched = (movie) => {
    setMovieLookup((prev) => ({
      ...prev,
      [movie.id]: {
        id: movie.id,
        title: movie.title || 'Untitled',
        poster_path: movie.poster_path || null,
        vote_average: movie.vote_average || 0,
      },
    }))
    setWatchedIds((prev) =>
      prev.includes(movie.id) ? prev.filter((movieId) => movieId !== movie.id) : [...prev, movie.id]
    )
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

  const heroMovie = featuredMovie || sortedMovies[0] || null
  const favoriteMovies = favoriteIds.map((movieId) => movieLookup[movieId]).filter(Boolean)
  const watchedMovies = watchedIds.map((movieId) => movieLookup[movieId]).filter(Boolean)
  const viewMovies = viewMode === 'favorites' ? favoriteMovies : viewMode === 'watched' ? watchedMovies : sortedMovies
  const heroViewMovie = viewMovies[0] || heroMovie
  const isEmptyView = viewMovies.length === 0

  return (
    <section className="movie-section">
      <Header
        featuredMovie={heroViewMovie}
        viewMode={viewMode}
        onViewChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onGetDescription={handleGetDescription}
      />
      {loading ? (
        <p className="movie-status">Loading movies…</p>
      ) : error ? (
        <div className="movie-status movie-status--error">
          <p>{error}</p>
          <button type="button" className="movie-statusRetry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : isEmptyView ? (
        <p className="movie-status">
          {viewMode === 'favorites'
            ? 'No favorite movies yet.'
            : viewMode === 'watched'
              ? 'No watched movies yet.'
              : activeQuery
                ? `No results for "${activeQuery}".`
                : 'No movies to show.'}
        </p>
      ) : (
        <>
          <div className="movie-grid">
            {viewMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                aveVote={movie.vote_average}
                isFavorite={favoriteIds.includes(movie.id)}
                isWatched={watchedIds.includes(movie.id)}
                onToggleFavorite={() => handleToggleFavorite(movie)}
                onToggleWatched={() => handleToggleWatched(movie)}
                onClick={() => onMovieSelect?.(movie.id)}
              />
            ))}
          </div>
          {viewMode === 'all' && page < totalPages ? (
            <button
              className="load-more-button"
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load More'}
            </button>
          ) : null}
        </>
      )}
    </section>
  )
}

MovieList.propTypes = {
  onMovieSelect: PropTypes.func,
}

export default MovieList
