$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCe-Thtn_khU__BOQVKdwfUn8VThnKbxzg",
        authDomain: "projectone-87e48.firebaseapp.com",
        databaseURL: "https://projectone-87e48.firebaseio.com",
        projectId: "projectone-87e48",
        storageBucket: "projectone-87e48.appspot.com",
        messagingSenderId: "574663628842"
    };
    firebase.initializeApp(config);

    // Variable to reference the database
    var database = firebase.database();

    // Capture user input and show search results
    $("#search-movie").on("click", function (e) {
        e.preventDefault();

        var movie = $("#movie-input").val().trim();
        var queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy&limit=10";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function (response) {

            // testing
            // console.log(response);

            var results = response.Search;

            $("#results").empty();
            for (var i = 0; i < results.length; i++) {

                // Movie poster 
                var movieImage = $("<img>");
                movieImage.addClass("results-img");
                movieImage.attr("src", results[i].Poster);

                // Movie info, including title and release year
                var movieResults = $("<div>");
                movieResults.addClass("results");
                movieResults.append("<div class='movie-info'><h2>" + results[i].Title + "</h2>");
                movieResults.append("<h3>Year: " + results[i].Year + "</h3>");

                // Open movie in IMDb on new page
                movieResults.append("<a href='https://www.imdb.com/title/" + results[i].imdbID + "'target='_blank'>Open on IMDb</a>");

                // Add to Wishlist button, append all info related to that specific movie
                movieResults.append("<button type='button' class='add-button' data-title='" + results[i].Title + "' data-year='" + response.Search[i].Year + "' data-poster='" + response.Search[i].Poster + "'>Add to Wish List</button>");

                // Insert movie results at end of movie information
                movieResults.append(movieImage);

                // Display on results div
                $("#results").append(movieResults);
            }
        })
    })

    // Display daily trending movies from imdb when "What's Trending" button is clicked
    $("#trending-movies").on("click", function (e) {
        e.preventDefault();

        // *** shows 20 instead of 10 movies ***
        var queryURL = "https://api.themoviedb.org/3/trending/movie/day?api_key=e3fddc668c4168ae60c8dd37482608e4&limit=10>";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function (response) {

            // testing
            // console.log(response);

            var res = response.results;
            $("#results").empty("");

            for (var i = 0; i < res.length; i++) {

                // Movie poster
                var trendingMoviesImg = "<img src='https://image.tmdb.org/t/p/w300/" + res[i].poster_path + "'</img>";

                // Movie title
                var trendingMovies = $("<div>");
                trendingMovies.addClass("trend-results");
                trendingMovies.append("<br><br><div class='trend-info'><h2>" + res[i].title + "</h2>");

                // Movie rating
                trendingMovies.append("<h5>Rating: " + res[i].vote_average + "</h5>");

                // Movie release date
                trendingMovies.append("<h5>Release Date: " + res[i].release_date + "</h5>");

                // ***** Fix This ***** -- doesn't open correct page
                // Open movie in IMDb
                trendingMovies.append("<a href='https://www.imdb.com/title/" + res[i].id + "/'target='_blank'>Open on IMDb</a><br>");

                // *****Fix this ***** -- doesn't show poster when movie is added to wishlist
                // Add to Wishlist button, append all info related to that specific movie
                trendingMovies.append("<button type='button' class='add-button' data-title='" + res[i].title + "'data-year='" + res[i].release_date + "'data-poster='" + res[i].poster_path + "'>Add to Wish List</button><br>");

                // Overview shows short movie description -- maybe do this on hover so screen doesn't look too crowded?
                // trendingMovies.append("<h6>Overview: " + res[i].overview + "</h6><br>");

                trendingMovies.append(trendingMoviesImg);

                $("#results").append(trendingMovies);
            }
        })
    })

    // When "Top User Searches" button is clicked, grab user searches from firebase and display on results div
    $("#user-favorites").on("click", function (e) {
        e.preventDefault();

        $("#results").empty("");
        $("#trending-movies").empty("");

        database.ref().on("child_added", function (childSnapshot) {
            var movieTitle = childSnapshot.val().title;
            var movieYear = childSnapshot.val().year;
            var moviePoster = childSnapshot.val().poster;

            // add to wishlist button ** not sure if we want this since it continues to add to both wishlist container and results div
            $("#results").prepend("<button type='button' class='add-button' data-title='" + movieTitle + "'data-year='" + movieYear + "'data-poster='" + moviePoster + "'>Add to Wish List</button><br>");

            // Show movie info from wishlist on page
            $("#results").prepend("<br><h2>" + movieTitle + "</h2><br>" + "<h3> Year: " + movieYear + "</h3><br>" + "<img src=" + moviePoster + "</img><br>");
        })
    })

    // Variable to store movies in wishlist container
    var favoriteMovies = [];

    // List of favorite movies on page
    var showFavoriteMovies = function () {

        $("#wishlist-container").html("");

        for (var i = 0; i < favoriteMovies.length; i++) {
            $("#wishlist-container").append("<div class='wishlist'><img class='movie-wish' src='" + favoriteMovies[i] + "'><button class='checkbox' id='" + i + "'>✓</button>");
        }
    }

    // Define behavior when an "add" button is clicked
    $(document).on("click", ".add-button", function () {

        // Push new movie ID into the array
        favoriteMovies.unshift($(this).attr("data-poster"));

        // Save the updated array into local storage
        localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));

        // Show the updated array on the web page
        showFavoriteMovies();

        // Push data from button click to firebase
        database.ref().push({
            title: $(this).attr("data-title"),
            year: $(this).attr("data-year"),
            poster: $(this).attr("data-poster"),
        });
    });

    // When a checkbox button is clicked, delete the item from wishlist
    $(document).on("click", ".checkbox", function () {

        // Delete item
        favoriteMovies.splice($(this).attr("id"), 1);

        // Update the list on the page
        showFavoriteMovies();

        // Save the updated array into local storage
        localStorage.setItem("favorite-movies", JSON.stringify(favoriteMovies));
    });

    // Populate the array from local storage
    favoriteMovies = JSON.parse(localStorage.getItem("favorite-movies"));

    // Keep the array empty if there are no movie IDs saved in local storage
    if (!Array.isArray(favoriteMovies)) {
        favoriteMovies = [];
    }

    // Populate the list of favorite movies
    showFavoriteMovies();

});