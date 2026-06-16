import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const FALLBACK_MESSAGE =
  "We couldn't generate a recommendation for this one — check out the overview above!"
const MAX_INSIGHT_LENGTH = 600
const TRAILER_PREVIEW_DELAY_MS = 1000

const getTrailerVideo = (movieDetails) =>
  movieDetails?.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
  ) ||
  movieDetails?.videos?.results?.find((video) => video.site === 'YouTube' && video.type === 'Trailer') ||
  null

const getMovieInsight = async (title, genres, overview, signal) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) return { ok: false, text: FALLBACK_MESSAGE }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Flixster',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content:
              'You are a movie recommendation assistant. Write a spoiler-free watch recommendation in plain text, 2-3 sentences. Do not use first-person voice. Do not use generic hype phrases like "must-see" or "thrilling ride". Do not compare to other films unless it is genuinely helpful. Do not invent actor names or facts not present in the provided context.',
          },
          {
            role: 'user',
            content: `Create a spoiler-free watch recommendation.\nTitle: ${title}\nGenres: ${genres}\nOverview: ${overview}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 429) console.warn('OpenRouter: rate limited (429)')
      else if (response.status === 401) console.warn('OpenRouter: invalid API key (401)')
      else if (response.status === 402) console.warn('OpenRouter: out of credits (402)')
      throw new Error(`OpenRouter error: ${response.status}`)
    }

    const data = await response.json()
    if (data?.error) {
      console.error('OpenRouter:', data.error)
      return { ok: false, text: FALLBACK_MESSAGE }
    }

    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) return { ok: false, text: FALLBACK_MESSAGE }

    return { ok: true, text: text.slice(0, MAX_INSIGHT_LENGTH) }
  } catch (error) {
    if (error.name === 'AbortError') return { ok: false, text: '', aborted: true }
    console.error('AI insight failed:', error)
    return { ok: false, text: FALLBACK_MESSAGE }
  }
}

const MovieModal = ({ isOpen, movieDetails, isLoading, errorMessage, onClose }) => {
  const [insightStatus, setInsightStatus] = useState('idle')
  const [insightText, setInsightText] = useState('')
  const [showTrailerPlayer, setShowTrailerPlayer] = useState(false)
  const insightControllerRef = useRef(null)
  const trailerTimerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (insightControllerRef.current) {
      insightControllerRef.current.abort()
      insightControllerRef.current = null
    }
    if (trailerTimerRef.current) {
      window.clearTimeout(trailerTimerRef.current)
      trailerTimerRef.current = null
    }
    setInsightStatus('idle')
    setInsightText('')
    setShowTrailerPlayer(false)
  }, [isOpen, movieDetails?.id])

  useEffect(() => {
    if (!isOpen || !movieDetails?.id || isLoading || errorMessage) return
    const trailerVideo = getTrailerVideo(movieDetails)
    if (!trailerVideo) return

    trailerTimerRef.current = window.setTimeout(() => {
      setShowTrailerPlayer(true)
      trailerTimerRef.current = null
    }, TRAILER_PREVIEW_DELAY_MS)

    return () => {
      if (trailerTimerRef.current) {
        window.clearTimeout(trailerTimerRef.current)
        trailerTimerRef.current = null
      }
    }
  }, [isOpen, movieDetails, isLoading, errorMessage])

  const handleGetDescription = () => {
    if (!movieDetails?.id || isLoading || errorMessage) return
    if (insightStatus === 'loading') return

    const title = movieDetails.title || 'Unknown title'
    const genres = movieDetails.genres?.length
      ? movieDetails.genres.map((genre) => genre.name).join(', ')
      : 'N/A'
    const overview = movieDetails.overview || 'No overview available.'

    const controller = new AbortController()
    insightControllerRef.current = controller
    setInsightStatus('loading')
    setInsightText('')

    getMovieInsight(title, genres, overview, controller.signal).then((result) => {
      if (controller.signal.aborted || result.aborted) return
      setInsightText(result.text)
      setInsightStatus(result.ok ? 'ready' : 'error')
    })
  }

  if (!isOpen) return null

  const posterUrl = movieDetails?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
    : 'https://placehold.co/500x750?text=No+Poster'

  const genreText = movieDetails?.genres?.length
    ? movieDetails.genres.map((genre) => genre.name).join(', ')
    : 'N/A'
  const trailerVideo = getTrailerVideo(movieDetails)
  const trailerUrl = trailerVideo?.key
    ? `https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1&mute=1&rel=0&modestbranding=1`
    : ''

  const renderInsight = () => {
    if (insightStatus === 'idle') {
      return (
        <div className="movie-modalAiSection">
          <button
            type="button"
            className="movie-modalAiButton"
            onClick={handleGetDescription}
          >
            ✨ Get Description
          </button>
        </div>
      )
    }
    if (insightStatus === 'loading') {
      return (
        <p className="movie-modalAiStatus" aria-live="polite">
          ✨ Getting a recommendation...
        </p>
      )
    }
    if (insightStatus === 'error') {
      return (
        <section className="movie-modalAiSection" aria-live="polite">
          <h4 className="movie-modalAiTitle">Heads up</h4>
          <p className="movie-modalAiBody">{insightText}</p>
          <button
            type="button"
            className="movie-modalAiButton"
            onClick={handleGetDescription}
          >
            Try again
          </button>
        </section>
      )
    }
    return (
      <section className="movie-modalAiSection" aria-live="polite">
        <p className="movie-modalAiBody">{insightText}</p>
      </section>
    )
  }

  return (
    <div
      className="movie-modalOverlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="movie-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modalTitle"
      >
        {isLoading ? <p className="movie-modalStatus">Loading movie details...</p> : null}

        {!isLoading && errorMessage ? (
          <p className="movie-modalError">{errorMessage} Please try again.</p>
        ) : null}

        {!isLoading && !errorMessage && movieDetails ? (
          <div className="movie-modalBody">
            <section className="movie-modalTrailerSection">
              {trailerVideo && showTrailerPlayer ? (
                <div className="movie-modalTrailerFrameWrap">
                  <iframe
                    className="movie-modalTrailerFrame"
                    src={trailerUrl}
                    title={`${movieDetails.title} trailer`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  className="movie-modalTopPoster"
                  src={posterUrl}
                  alt={`${movieDetails.title} poster`}
                />
              )}
            </section>

            <section className="movie-modalDetailsLayout">
              <img className="movie-modalPoster" src={posterUrl} alt={`${movieDetails.title} poster`} />
              <div className="movie-modalDetailsPanel">
                <h3 id="movie-modalTitle" className="movie-modalTitle">{movieDetails.title}</h3>
                <p className="movie-modalMeta">
                  Runtime: {movieDetails.runtime || 'N/A'} min | Release: {movieDetails.release_date || 'N/A'}
                </p>
                <p className="movie-modalMeta">Genres: {genreText}</p>
                <p className="movie-modalOverview">{movieDetails.overview || 'No overview available.'}</p>
                {renderInsight()}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}

MovieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  movieDetails: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    runtime: PropTypes.number,
    release_date: PropTypes.string,
    overview: PropTypes.string,
    backdrop_path: PropTypes.string,
    poster_path: PropTypes.string,
    videos: PropTypes.shape({
      results: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          site: PropTypes.string,
          type: PropTypes.string,
          official: PropTypes.bool,
        })
      ),
    }),
    genres: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  }),
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

export default MovieModal
