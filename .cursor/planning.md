### Compnent Architecture
-List of compnents  my app will need:
-App
- MovieList:This compnent is responsible for fetching data and rendring or filling each MovieCard
-MovieCard: This compnonet is responsible for storing information anout each movie(name, release date, image,..) which are passed through the MovieList.
-SearchBar: This compnent is responsoble for assisting in search of Movies in either :recently added, from A-Z, fans favorite,...
-MovieModal: This compenet is in charge of displaying a modal with movie details and closes when user clicks outside, presses Escape, or clicks X.
-MovieModal props:
  -isOpen: boolean
  -movieDetails: object containing movie detail response
  -isLoading: boolean
  -errorMessage: string
  -onClose: callback
-MovieModal renders:
  -backdrop image
  -title
  -runtime
  -release date
  -genres
  -overview
-Open/Close behavior:
  -MovieCard click opens modal
  -X button closes modal
  -clicking overlay closes modal
  -pressing Escape closes modal

-Header: This compnent should inclde the header of the website with the title of the page and also an image that picks a random movie poster and once refreshed.
-Footer
-SortControl

### API Contracts
-Now Playing endpoint
-URL: https://api.themoviedb.org/3/movie/now_playing
-Required params: api_key, page

-Search endpoint
-URL: https://api.themoviedb.org/3/search/movie
-Required params: query, api_key, page

-Movie Details endpoint
-URL: https://api.themoviedb.org/3/movie/{movie_id}
-Required params: api_key
-Path params: movie_id
-Response fields used:
  -title
  -runtime
  -release_date
  -genres
  -overview
  -backdrop_path
-Error cases:
  -404 movie not found
  -401 bad api key
  -network failure

-Response shape (both endpoints)
-page: number
-results: Movie[]
-total_pages: number
-total_results: number


### State Architecture
-MovieList state:
  -movies
  -loading
  -loadingMore
  -error
  -page
  -totalPages
  -searchQuery
  -activeQuery
  -sortOption (controls movie ordering in UI)
    -title-az
    -release-newest
    -vote-highest
-App modal state:
  -selectedMovieId
  -isModalOpen
  -movieDetails
  -detailsLoading
  -detailsError

### Data Flow
-MovieList fetches now playing and search list data.
-MovieList renders MovieCard and passes click handler.
-MovieCard click triggers onMovieSelect(movie.id).
-App stores selectedMovieId and isModalOpen.
-App useEffect fetches movie details when selectedMovieId is set.
-App passes details/loading/error + onClose into MovieModal.
-MovieModal renders detail view and calls onClose to clear selected movie and close modal.

### AI Feature Spec
When generating ai decrption AI should talk about at least 3 top stars of the show main characters and other at least 1 famous movie playeed if there is. 


