import './MovieCard.css'

function MovieCard({ title, posterPath, aveVote, onClick }) {
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster'
    //the above is a fallback image if the poster is not found

  return (
    <article
      className="movie-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick()
        }
      }}
    >
      <img className="movie-cardPoster" src={posterUrl} alt={`${title} poster`} />
      <div className="movie-cardContent">
        <h2 className="movie-cardTitle">{title}</h2>
        <p className="movie-cardVoteAverage">{aveVote}</p>
      </div>
    </article>
  )
}

export default MovieCard