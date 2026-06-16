## Component Architecture

### 1) `App`
- **Responsibility:** Top-level app shell. Owns selected movie state and modal lifecycle.
- **Renders:** `MovieList`, `MovieModal`, app layout wrappers.
- **Key props:** None (root component).

### 2) `MovieList`
- **Responsibility:** Fetches and manages movie collections (now playing/search), sorting, filtering, pagination, favorite/watched state.
- **Renders:** `Header`, movie grid of `MovieCard`, loading/error/empty states, load-more button.
- **Props:**
  - `onMovieSelect(movieId: number): void` - callback to parent (`App`) when user selects a movie.

### 3) `Header`
- **Responsibility:** Displays hero/banner content and top controls.
- **Renders:** Brand/menu controls, search toggle + `SearchBar`, sort dropdown, featured movie hero text.
- **Props:**
  - `featuredMovie: Movie | null`
  - `viewMode: 'all' | 'favorites' | 'watched'`
  - `onViewChange(mode): void`
  - `searchQuery: string`
  - `onSearchChange(value): void`
  - `onSearchSubmit(event): void`
  - `onClearSearch(): void`
  - `sortOption: string`
  - `onSortChange(value): void`

### 4) `SearchBar`
- **Responsibility:** Controlled search input and submit/clear actions.
- **Renders:** Input, search submit trigger, clear control.
- **Props:**
  - `value: string`
  - `onChange(value): void`
  - `onSubmit(event): void`
  - `onClear(): void`

### 5) `MovieCard`
- **Responsibility:** Displays a single movie summary and quick actions.
- **Renders:** Poster, title, vote average, favorite toggle, watched toggle.
- **Props:**
  - `title: string`
  - `posterPath?: string`
  - `aveVote?: number`
  - `isFavorite?: boolean`
  - `isWatched?: boolean`
  - `onToggleFavorite?(): void`
  - `onToggleWatched?(): void`
  - `onClick?(): void`

### 6) `MovieModal`
- **Responsibility:** Shows detailed movie information + AI watch recommendation.
- **Renders:** Overlay/modal container, backdrop image, title/runtime/release/genres/overview, AI recommendation block, close controls.
- **Props:**
  - `isOpen: boolean`
  - `movieDetails: object | null`
  - `isLoading: boolean`
  - `errorMessage: string | null`
  - `onClose(): void`


## API Contracts

### 1) TMDb Now Playing
- **Method / URL:** `GET https://api.themoviedb.org/3/movie/now_playing`
- **Query params:** `api_key` (required), `page` (required for pagination)
- **Response fields used:**
  - top-level: `page`, `results`, `total_pages`, `total_results`
  - each movie: `id`, `title`, `poster_path`, `vote_average`, `release_date`, `overview`, `backdrop_path`
- **Error cases handled:** network failure, invalid API key (`401`), unexpected API payload

### 2) TMDb Search Movies
- **Method / URL:** `GET https://api.themoviedb.org/3/search/movie`
- **Query params:** `api_key` (required), `query` (required), `page` (required)
- **Response fields used:**
  - top-level: `page`, `results`, `total_pages`
  - each movie: `id`, `title`, `poster_path`, `vote_average`, `release_date`, `overview`, `backdrop_path`
- **Error cases handled:** empty query, no matches, network failure, invalid API key

### 3) TMDb Movie Details
- **Method / URL:** `GET https://api.themoviedb.org/3/movie/{movie_id}`
- **Path params:** `movie_id` (required)
- **Query params:** `api_key` (required)
- **Response fields used:** `id`, `title`, `runtime`, `release_date`, `genres`, `overview`, `backdrop_path`
- **Error cases handled:** `404` not found, `401` invalid key, request cancellation/abort

### 4) OpenRouter Recommendation
- **Method / URL:** `POST https://openrouter.ai/api/v1/chat/completions`
- **Headers:** `Authorization`, `HTTP-Referer`, `X-Title`, `Content-Type: application/json`
- **Body includes:** model, messages with movie context (title/genres/overview), generation settings
- **Response fields used:** generated text content from first response choice
- **Error cases handled:** missing API key, non-200 response, malformed response, timeout/abort


## State Architecture

### `MovieList` state
- `movies` | `Movie[]` | `[]` | owner: `MovieList` | updates on fetch success (initial/search/load more)
- `featuredMovie` | `Movie | null` | `null` | owner: `MovieList` | updates after non-search fetch
- `loading` | `boolean` | `true` | owner: `MovieList` | toggled during non-append fetch cycles
- `loadingMore` | `boolean` | `false` | owner: `MovieList` | toggled during pagination fetch
- `error` | `string | null` | `null` | owner: `MovieList` | set on failed list fetch; cleared on retry/new fetch
- `page` | `number` | `1` | owner: `MovieList` | updated from API response
- `totalPages` | `number` | `1` | owner: `MovieList` | updated from API response
- `searchQuery` | `string` | `''` | owner: `MovieList` | updates as user types
- `activeQuery` | `string` | `''` | owner: `MovieList` | updates on search submit/clear
- `sortOption` | `string` | `''` | owner: `MovieList` | updates when user picks sort option
- `viewMode` | `'all' | 'favorites' | 'watched'` | `'all'` | owner: `MovieList` | updates from header menu actions
- `favoriteIds` | `number[]` | `[]` | owner: `MovieList` | updates when user toggles heart icon
- `watchedIds` | `number[]` | `[]` | owner: `MovieList` | updates when user toggles eye icon
- `movieLookup` | `Record<number, MovieSummary>` | `{}` | owner: `MovieList` | updated after fetch and toggle actions for favorites/watched lookup

### `App` modal state
- `selectedMovieId` | `number | null` | `null` | owner: `App` | updates when user clicks a movie tile
- `isModalOpen` | `boolean` | `false` | owner: `App` | updates on select/close
- `movieDetails` | `MovieDetails | null` | `null` | owner: `App` | updates after details fetch success
- `detailsLoading` | `boolean` | `false` | owner: `App` | toggled during details request
- `detailsError` | `string | null` | `null` | owner: `App` | set when details request fails

### `MovieModal` AI state
- `insightStatus` | `'idle' | 'loading' | 'ready' | 'error'` | `'idle'` | owner: `MovieModal` | updates around AI request lifecycle
- `insightText` | `string` | `''` | owner: `MovieModal` | set when AI response succeeds or fallback needed


## Data Flow

On initial load, `MovieList` calls TMDb now-playing and stores normalized movie results in `movies` and `movieLookup`. Before rendering, data is transformed according to app mode: non-search results may be shuffled, then optionally sorted (`title`, `release date`, `vote average`), then filtered by `viewMode` (`all`, `favorites`, `watched`) using `favoriteIds`/`watchedIds`. The final array (`viewMovies`) is mapped to `MovieCard` props (`title`, `posterPath`, `aveVote`, toggles, click handler). When a card is clicked, `MovieList` calls `onMovieSelect(movie.id)` to `App`; `App` opens `MovieModal` and fetches TMDb movie details. `MovieModal` renders details and triggers AI recommendation generation (OpenRouter) from detail fields (`title`, `genres`, `overview`) to show a short watch recommendation with loading and fallback states.


## AI Feature Spec

- **Role:** Movie recommendation assistant that writes concise, spoiler-free watch guidance.
- **Task:** Given movie metadata, generate a 2-3 sentence recommendation that helps a user decide whether to watch.
- **Inputs:** `title`, `genres` (comma-separated), `overview`.
- **Output format:** Plain text only, 2-3 sentences, neutral tone, no first-person voice.
- **Constraints:**
  - No plot spoilers.
  - No invented facts (especially cast/crew not provided in input).
  - No overly generic hype language.
  - Keep recommendation grounded in provided context.
- **Failure behavior:** Show friendly fallback message under a "Heads up" heading:
  - `"We couldn't generate a recommendation for this one - check out the overview above!"`
- **Trigger condition:** Run when modal is open, a valid movie detail object exists, and details are not loading/errored.
- **Cancellation policy:** Abort previous AI request when modal closes or selected movie changes.
