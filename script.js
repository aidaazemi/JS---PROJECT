const apiKey = "5e773c575131c9fb172ac16d5143621f";

const formFilter = document.getElementById("form");
const genresField = document.getElementById("genres-field");
const countriesField = document.getElementById("countries-field");
const genresLabel = document.getElementById("genres-label");
const countriesLabel = document.getElementById("countries-label");

const formSearch = document.getElementById("form-search");

const movieList = document.getElementById("movie-list");

let isSearchQuery = false;

document.addEventListener("DOMContentLoaded", function () {
  filterMovies();
  fetchGenres();
  fetchCountries();
});

genresLabel.addEventListener("click", () => {
  document.getElementById("genre-list").classList.toggle("show");
});

countriesLabel.addEventListener("click", () => {
  document.getElementById("countries-list").classList.toggle("show");
});

formFilter.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("search-input");
  searchInput.value = null;
  isSearchQuery = false;

  const genreInput = document.querySelectorAll(
    'input[name="genre-input"]:checked'
  );
  const countryInput = document.querySelectorAll(
    'input[name="country-input"]:checked'
  );
  const yearInput = document.getElementById("year-input");

  let genreTerm = "";
  let countryTerm = "";
  let yearTerm = yearInput.value;

  genreInput.forEach((checkbox) => {
    genreTerm += `,${checkbox.value}`;
  });
  countryInput.forEach((checkbox) => {
    countryTerm += `,${checkbox.value}`;
  });

  filterMovies(1, genreTerm.substring(1), countryTerm.substring(1), yearTerm);
});

formSearch.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("search-input");

  const genreInput = document.querySelectorAll(
    'input[name="genre-input"]:checked'
  );
  const countryInput = document.querySelectorAll(
    'input[name="country-input"]:checked'
  );
  const yearInput = document.getElementById("year-input");
  yearInput.value = null;

  genreInput.forEach((el) => (el.checked = false));
  if (document.getElementById("genre-list").classList.contains("show")) {
    document.getElementById("genre-list").classList.remove("show");
  }

  countryInput.forEach((el) => (el.checked = false));
  if (document.getElementById("countries-list").classList.contains("show")) {
    document.getElementById("countries-list").classList.remove("show");
  }

  isSearchQuery = true;
  const searchTerm = searchInput.value;
  searchMovies(searchTerm, 1);
});

function fetchGenres() {
  let genreList = document.createElement("div");
  genreList.classList.add("hide");
  genreList.id = "genre-list";

  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      data.genres.forEach((genre) => {
        let genreBox = document.createElement("div");
        let genreCheckbox = document.createElement("input");
        genreCheckbox.type = "checkbox";
        genreCheckbox.name = "genre-input";
        genreCheckbox.value = genre.id;

        genreBox.append(genreCheckbox);
        genreBox.append(genre.name);
        genreList.append(genreBox);
      });
      genresField.append(genreList);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function fetchCountries() {
  let countriesList = document.createElement("div");
  countriesList.classList.add("hide");
  countriesList.id = "countries-list";

  fetch(
    `https://api.themoviedb.org/3/watch/providers/regions?api_key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.results.forEach((country) => {
        let countriesBox = document.createElement("div");
        let countriesCheckbox = document.createElement("input");
        countriesCheckbox.type = "checkbox";
        countriesCheckbox.name = "country-input";
        countriesCheckbox.value = country.iso_3166_1;

        countriesBox.append(countriesCheckbox);
        countriesBox.append(country.english_name);
        countriesList.append(countriesBox);
      });
      countriesField.append(countriesList);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function filterMovies(page = 1, genre = "", country = "", year = "") {
  movieList.innerHTML = "";

  const apiUrl = `https://api.themoviedb.org/3/discover/movie/?api_key=${apiKey}&page=${page}&with_genres=${genre}&region=${country}&year=${year}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      let totalPages = data.total_pages;
      if (data.total_pages > 500) {
        totalPages = 500;
      }
      displayMovies(data.results);
      renderButtons(totalPages, data.page);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function searchMovies(query, page = 1) {
  movieList.innerHTML = "";

  const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      let totalPages = data.total_pages;
      if (data.total_pages > 500) {
        totalPages = 500;
      }
      displayMovies(data.results);
      renderButtons(totalPages, data.page);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function displayMovies(movies) {
  if (movies.length < 1) {
    const noResults = document.createElement("div");
    noResults.innerHTML = `No results found`;
    movieList.appendChild(noResults);
  } else {
    movies.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie");

      const imageSrc = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "./Assets/Image/movie.jpg";

      movieCard.innerHTML = `
      <img src="${imageSrc}" alt="${movie.title} Image" />
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <span class="green">${movie.vote_average}</span>
        <p>Year: ${
          movie.release_date ? movie.release_date.substring(0, 4) : "N/A"
        }</p>
      </div>
      <button class="details-button" data-movie-id="${
        movie.id
      }">Details</button>
    `;

      const detailsButton = movieCard.querySelector(".details-button");
      detailsButton.addEventListener("click", () => {
        const movieId = detailsButton.getAttribute("data-movie-id");
        fetchMovieDetails(movieId, movieCard);
      });

      movieList.appendChild(movieCard);
    });
  }
}

function renderButtons(totalPages, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const firstButton = document.createElement("button");
  firstButton.textContent = "First";
  firstButton.addEventListener("click", () => {
    const genreInput = document.querySelectorAll(
      'input[name="genre-input"]:checked'
    );
    const countryInput = document.querySelectorAll(
      'input[name="country-input"]:checked'
    );
    const yearInput = document.getElementById("year-input");
    const searchInput = document.getElementById("search-input");

    let genreTerm = "";
    let countryTerm = "";
    let yearTerm = yearInput.value;
    let searchTerm = searchInput.value;

    genreInput.forEach((checkbox) => {
      genreTerm += `,${checkbox.value}`;
    });
    countryInput.forEach((checkbox) => {
      countryTerm += `,${checkbox.value}`;
    });

    if (isSearchQuery) {
      searchMovies(searchTerm, 1);
    } else {
      filterMovies(1, genreTerm, countryTerm, yearTerm);
    }
  });

  const lastButton = document.createElement("button");
  lastButton.textContent = "Last";
  lastButton.addEventListener("click", () => {
    const genreInput = document.querySelectorAll(
      'input[name="genre-input"]:checked'
    );
    const countryInput = document.querySelectorAll(
      'input[name="country-input"]:checked'
    );
    const yearInput = document.getElementById("year-input");
    const searchInput = document.getElementById("search-input");

    let genreTerm = "";
    let countryTerm = "";
    let yearTerm = yearInput.value;
    let searchTerm = searchInput.value;

    genreInput.forEach((checkbox) => {
      genreTerm += `,${checkbox.value}`;
    });
    countryInput.forEach((checkbox) => {
      countryTerm += `,${checkbox.value}`;
    });

    if (isSearchQuery) {
      searchMovies(searchTerm, totalPages);
    } else {
      filterMovies(totalPages, genreTerm, countryTerm, yearTerm);
    }
  });

  pagination.appendChild(firstButton);

  let paginationFirstButton = 1;
  let paginationLastButton = 5;
  if (totalPages < 5) {
    paginationLastButton = totalPages;
  } else {
    if (currentPage > 3) {
      paginationFirstButton = currentPage - 2;
      paginationLastButton = currentPage + 2;
    }
    if (totalPages - currentPage < 2) {
      paginationFirstButton = totalPages - 4;
      paginationLastButton = totalPages;
    }
  }
  for (let i = paginationFirstButton; i <= paginationLastButton; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => {
      const genreInput = document.querySelectorAll(
        'input[name="genre-input"]:checked'
      );
      const countryInput = document.querySelectorAll(
        'input[name="country-input"]:checked'
      );
      const yearInput = document.getElementById("year-input");
      const searchInput = document.getElementById("search-input");

      let genreTerm = "";
      let countryTerm = "";
      let yearTerm = yearInput.value;
      let searchTerm = searchInput.value;

      genreInput.forEach((checkbox) => {
        genreTerm += `,${checkbox.value}`;
      });
      countryInput.forEach((checkbox) => {
        countryTerm += `,${checkbox.value}`;
      });

      if (isSearchQuery) {
        searchMovies(searchTerm, i);
      } else {
        filterMovies(i, genreTerm, countryTerm, yearTerm);
      }
    });

    if (i === currentPage) {
      pageButton.disabled = true;
    }

    pagination.appendChild(pageButton);
  }

  pagination.appendChild(lastButton);
}

function fetchMovieDetails(movieId, movieCard) {
  const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      displayMovieDetails(data, movieCard);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function displayMovieDetails(movie, movieCard) {
  const movieInfo = movieCard.querySelector(".movie-info");

  const movieDetails = `
 <p>${movie.overview}</p>`;

  movieInfo.innerHTML += movieDetails;
}
