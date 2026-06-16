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

Role: A movie recommendation assistant that writes a short, spoiler-free watch recommendation.

Task: Given a movie's title, genres, and overview, write a 2-3 sentence recommendation that helps a viewer decide whether the film fits their mood — without spoiling the plot.

Inputs: title, genres (comma-separated list), overview. (No cast data is fetched, so the prompt explicitly forbids inventing actor names.)

Output: plain text, 2-3 sentences, no first-person voice.

Constraints:
- No plot spoilers
- No first-person ("I", "we") voice
- No generic hype phrases like "must-see" or "thrilling ride"
- No comparisons to other films unless genuinely helpful
- No invented actor names or facts not present in the input context

Failure behavior: a friendly fallback message — "We couldn't generate a recommendation for this one — check out the overview above!" — rendered under a "Heads up" header (not "AI Take") so the user is not misled into thinking the AI wrote the failure message.

OpenRouter integration:
- Endpoint: https://openrouter.ai/api/v1/chat/completions
- Model: openrouter/free (Free Models Router — picks an available free model at random, automatically filtered by required capabilities)
- Headers: Authorization Bearer + HTTP-Referer + X-Title (attribution headers improve free-tier rate-limit behavior)
- API key: VITE_OPENROUTER_API_KEY (loaded from .env, gitignored)

State (lives in MovieModal):
- insightStatus: 'idle' | 'loading' | 'ready' | 'error'
- insightText: string

Trigger: when isOpen becomes true AND movieDetails.id is set AND TMDB details are not loading or errored. Each movie change aborts the prior fetch via AbortController.

Display:
- 'idle' / 'loading' → "✨ Getting a recommendation..." line below the overview
- 'ready' → "AI Take" h4 + insight body
- 'error' → "Heads up" h4 + fallback message body

### AI Feature — Decisions Log
- **What the API returned initially:** Early draft outputs tended to sound generic and overused broad recommendation language. They also occasionally fabricated cast details, since no cast data was provided.
- **What I changed in my prompt:** Tightened the system role to enforce 2-3 spoiler-free sentences, plain text only, no first-person wording, no generic "must-see" phrasing, no comparisons to other films unless helpful, and an explicit "do not invent actor names or facts not in the context" rule.
- **What fallback behavior I implemented:** If OpenRouter fails (HTTP error, network error, malformed response, missing key, or empty/error body), the modal shows the fallback message under a "Heads up" header — separate from the "AI Take" header — so failures are not mis-branded as AI output. The fetch is wrapped in an AbortController so closing the modal mid-flight cancels the request.
- **What I learned:** Prompt engineering works best when output shape and safety constraints are explicit. A `{ ok, text }` return shape from the fetcher plus an explicit status state machine (`idle | loading | ready | error`) is much more robust than inferring loading state from string emptiness.
