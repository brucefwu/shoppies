
const searchBar = document.getElementById('searchBar');
const searchResults = document.getElementById('searchResults');
const nominated = document.getElementById('nominated');
const banner = document.getElementById('banner');
const directorsList = document.getElementById('directorsList');

const baseSearchUrl = 'https://www.omdbapi.com/?apikey=27fb58b1&type=movie&s=';
const baseTitleUrl = 'https://www.omdbapi.com/?apikey=27fb58b1&type=movie&i=';

var imdbInfo = [];

searchBar.addEventListener('input', function(e) {
  const searchTerm = this.value;
  if (searchTerm.length > 2) {

    fetch(baseSearchUrl + searchTerm).then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(response);
      }
    }).then(function(data) {
      if (data.Search) {
        searchResults.innerHTML = '';
        data.Search.slice(0, 5).forEach(item => {
          if (!document.getElementById(item.imdbID)) {
            addToSearchResults(item);
          }
        });
      }
    }).catch(function(err) {
      console.warn(err);
    });
  } else {
    searchResults.innerHTML = '';
  }
});

function addToSearchResults(searchItem) {
  var li = document.createElement('li');
  li.innerText = searchItem.Title + ' (' + searchItem.Year + ')';
  li.id = searchItem.imdbID;

  var but = document.createElement('button');
  but.innerText = 'Nominate';
  but.classList.add('btn', 'btn-primary');
  but.addEventListener('click', function(e) {
    if (nominated.childElementCount < 5) {
      this.disabled = true;
      addToNominated(this.parentElement);
    }
  });
  if (document.getElementById('n' + li.id)) {
    but.disabled = true;
  }

  li.appendChild(but);
  searchResults.appendChild(li);
}

function addToNominated(movieItem) {
  var li = document.createElement('li');
  li.innerText = movieItem.firstChild.textContent;
  li.id = 'n' + movieItem.id;

  var but = document.createElement('button');
  but.innerText = 'Remove';
  but.classList.add('btn', 'btn-danger');
  but.addEventListener('click', function(e) {
    const parent = this.parentElement;
    const parentId = parent.id.slice(1);
    const searchItem = document.getElementById(parentId);
    if (searchItem) {
      searchItem.lastElementChild.disabled = false;
    }
    if (nominated.childElementCount === 5) {
      banner.hidden = true;
    }
    parent.remove();
    imdbInfo = imdbInfo.filter(movie => movie.imdbID != parentId);
  });

  li.appendChild(but);
  nominated.appendChild(li);
  addToInfo(movieItem.id);
  if (nominated.childElementCount === 5) {
    banner.hidden = false;
  }
}

function addToInfo(id) {
  fetch(baseTitleUrl + id).then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(response);
    }
  }).then(function(data) {
    if (data.Director) {
      imdbInfo.push(data);
    }
    if (nominated.childElementCount === 5) {
      populateDirectors();
    }
  }).catch(function(err) {
    console.warn(err);
  });
}

function populateDirectors() {
  directorsList.innerHTML = '';

  var directors = [];
  imdbInfo.forEach(movie => {
    const director = movie.Director;
    const filter = directors.filter(d => d.name === director);
    if (filter.length === 0) {
      directors.push({name: director, count: 1});
    } else {
      directors[directors.indexOf(filter[0])].count++;
    }
  });

  directors.forEach(d => {
    var li = document.createElement('li');
    if (d.count === 1) {
      li.innerText = d.name + ' (1 movie)';
    } else {
      li.innerText = d.name + ' (' + d.count + ' movies)';
    }

    directorsList.appendChild(li);
  });
}
