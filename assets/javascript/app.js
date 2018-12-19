$(document).ready(function() {

// VARIABLES
// ==================================================

// List of favorite movies
var favoriteMovies = [];


// FUNCTIONS FOR LATER USE
// ==================================================

// Create the list of favorite movies on the web page
var showFavoriteMovies = function() {

    $("#wishlist-container").html("");

    for (i = 0; i < favoriteMovies.length; i++) {
              
        $("#wishlist-container").append("<div class='wishlist'><img class='movie-wish' src='" + favoriteMovies[i] + "'><button class='checkbox' id='" + i + "'>✓</button>");

    }
}


// USER-TRIGGERED BEHAVIOR
// ==================================================

// Capture user input and show search results
$("#search-movie").on("click", function(event) {

    event.preventDefault();

    var movie = $("#movie-input").val().trim();

    var queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";

    $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
  
        console.log(response);
        
        $("#results-div").empty();

        var maxResults;

        if (response.Search.length > 10) {
            maxResults = 10;
        }

        else {
            maxResults = response.Search.length;
        }

        for (i = 0; i < maxResults; i++) {

            $("#results-div").append("<div class='results'><img class='result-img' src='" + response.Search[i].Poster + "'><div class='movie-info'><h2>" + response.Search[i].Title + "</h2><h3>Year: " + response.Search[i].Year + "</h3><a href='https://www.imdb.com/title/" + response.Search[i].imdbID + "' target='_blank'>Open on IMDb</a><button type='button' class='add-button' data-poster='" + response.Search[i].Poster + "'>Add to Wish List</button></div></div>");

        }

      });

  });

// Define behavior when an "add" button is clicked
$(document).on("click", ".add-button", function(){

    // Push new movie ID into the array
    favoriteMovies.unshift($(this).attr("data-poster"));

    // Save the updated array into local storage
    localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));

    // Show the updated array on the web page
    showFavoriteMovies();

});

// Define behavior when a checkbox button is clicked
$(document).on("click", ".checkbox", function() {

    // Delete the item for which the checkbox was clicked
    favoriteMovies.splice($(this).attr("id"), 1);

    // Update the list on the page
    showFavoriteMovies();

    // Save the updated array into local storage
    localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));

  });


// BEHAVIOR ON PAGE LOAD
// ==================================================

// Populate the array from local storage
favoriteMovies = JSON.parse(localStorage.getItem("favorite-movies"));

// Keep the array empty if there are no movie IDs saved in local storage
if (!Array.isArray(favoriteMovies)) {
    favoriteMovies = [];
  }

// Populate the list of favorite movies
showFavoriteMovies();

});