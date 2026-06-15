import { useEffect } from 'react'

const MovieModal = ({ isOpen, movieDetails, isLoading, errorMessage, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const backdropUrl = movieDetails?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`
    : 'https://via.placeholder.com/1280x720?text=No+Backdrop'

  const genreText = movieDetails?.genres?.length
    ? movieDetails.genres.map((genre) => genre.name).join(', ')
    : 'N/A'

  return (
    <div
      className="movie-modalOverlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        className="movie-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {isLoading ? <p className="movie-modalStatus">Loading movie details...</p> : null}

        {!isLoading && errorMessage ? (
          <p className="movie-modalError">{errorMessage} Please try again.</p>
        ) : null}

        {!isLoading && !errorMessage && movieDetails ? (
          <div className="movie-modalBody">
            <img
              className="movie-modalBackdrop"
              src={backdropUrl}
              alt={`${movieDetails.title} backdrop`}
            />
            <h3 className="movie-modalTitle">{movieDetails.title}</h3>
            <p className="movie-modalMeta">
              Runtime: {movieDetails.runtime || 'N/A'} min | Release: {movieDetails.release_date || 'N/A'}
            </p>
            <p className="movie-modalMeta">Genres: {genreText}</p>
            <p className="movie-modalOverview">{movieDetails.overview || 'No overview available.'}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default MovieModal
