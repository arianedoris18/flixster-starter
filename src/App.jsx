import { useEffect, useState } from 'react'
import MovieList from './components/MovieList'
import MovieModal from './components/MovieModal'
import Footer from './components/Footer'
import './App.css'

const App = () => {
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movieDetails, setMovieDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    if (!selectedMovieId || !isModalOpen) return

    const apiKey = import.meta.env.VITE_API_KEY
    const controller = new AbortController()

    const fetchMovieDetails = async () => {
      setDetailsLoading(true)
      setDetailsError('')

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedMovieId}?api_key=${apiKey}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Movie details not found (404).')
          }
          if (response.status === 401) {
            throw new Error('Invalid API key (401). Check your VITE_API_KEY.')
          }
          throw new Error('Unable to fetch movie details right now.')
        }

        const data = await response.json()
        setMovieDetails(data)
      } catch (error) {
        if (error.name === 'AbortError') return
        setDetailsError(error.message || 'Network error while fetching movie details.')
      } finally {
        setDetailsLoading(false)
      }
    }

    fetchMovieDetails()

    return () => controller.abort()
  }, [selectedMovieId, isModalOpen])

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId)
    setMovieDetails(null)
    setDetailsError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMovieId(null)
    setMovieDetails(null)
    setDetailsError('')
  }

  return (
    <div className="App">
      <main className="app-main">
        <MovieList onMovieSelect={handleMovieSelect} />
      </main>
      <Footer />
      <MovieModal
        isOpen={isModalOpen}
        movieDetails={movieDetails}
        isLoading={detailsLoading}
        errorMessage={detailsError}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default App
