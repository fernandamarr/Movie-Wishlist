$(document).ready(function () {

    // Hide the video player and its background on page load
    $("#video-player").hide();
    $("#video-background").hide();

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

        // Validate input
        if (movie == "") {
            swal({
                title: "No input",
                text: "Please write something in the search box",
                icon: "error",
                });
        }

        else {

            var queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";

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
                    movieResults.addClass("search-results");
                    movieResults.append("<div class='movie-info'><h3>" + results[i].Title + "</h3><h4>Year: " + results[i].Year + "</h4><a href='#' class='watch-trailer' id='" + results[i].imdbID + "' data-title='" + results[i].Title + "'>Watch Trailer</a><a class='open-imdb' href='https://www.imdb.com/title/" + results[i].imdbID + "'target='_blank'>Open on IMDb</a><button type='button' class='add-button' data-title='" + results[i].Title + "' data-year='" + results[i].Year + "' data-poster='" + results[i].Poster + "'>Add to Wish List</button>");

                    // Insert movie results next to the image
                    movieResults.prepend(movieImage);

                    // Display on results div
                    $("#results").append(movieResults);
                }
            })
        }
    })

    // Display daily trending movies from imdb when "What's Trending" button is clicked
    $("#trending-movies").on("click", function (e) {
        e.preventDefault();

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
                var trendingMoviesImg = "<img class='results-img'  src='https://image.tmdb.org/t/p/w200/" + res[i].poster_path + "'>";

                // Movie title
                var trendingMovies = $("<div>");
                trendingMovies.addClass("trend-results");
                trendingMovies.append("<div class='trend-info'><h3>" + res[i].title + "</h3><h4>Release Date: " + res[i].release_date + "</h4><button type='button' class='add-button' data-title='" + res[i].title + "'data-year='" + res[i].release_date + "'data-poster='https://image.tmdb.org/t/p/w200" + res[i].poster_path + "'>Add to Wish List</button>");

                trendingMovies.prepend(trendingMoviesImg);

                $("#results").append(trendingMovies);
            }
        })
    })

    // When "Top User Searches" button is clicked, grab user searches from firebase and display on results div
    $("#user-favorites").on("click", function (e) {
        e.preventDefault();

        $("#results").empty("");

        database.ref().on("child_added", function (childSnapshot) {

            var movieTitle = childSnapshot.val().title;
            var movieYear = childSnapshot.val().year;
            var moviePoster = childSnapshot.val().poster;

            // Movie title
            var userMovies = $("<div>");
            userMovies.addClass("trend-results");
            userMovies.append("<div class='trend-info'><h3>" + movieTitle + "</h3><h4>Release: " + movieYear + "</h4><button type='button' class='add-button' data-title='" + movieTitle + "'data-year='" + movieYear + "'data-poster='" + moviePoster + "'>Add to Wish List</button>");

            userMovies.prepend("<img class='user-movies' src='" + moviePoster + "'>");

            $("#results").prepend(userMovies);
        });
    });

    // Define behavior when a "trailer" link is clicked
    $(document).on("click", ".watch-trailer", function () {

        // Capture the IMDb ID
        var clickedID = $(this).attr("id");
        var clickedMovieTitle = $(this).attr("data-title");

        // Use the MovieDB API to add trailers to each result
        var MDBqueryURL = "https://api.themoviedb.org/3/movie/" + clickedID + "/videos?api_key=e3fddc668c4168ae60c8dd37482608e4";

        // Return error message if the movie has no trailer available
        function trailerError() {
            swal({
                title: "Sorry!",
                text: "There is no trailer available for \"" + clickedMovieTitle + "\"",
                icon: "error",
            });
        }

        $.ajax({
            url: MDBqueryURL,
            method: "GET"
        })

            .done(function (trailerResponse) {

                if (trailerResponse.results.length > 0) {
                    $("#video-background").show();
                    $("#video-player").show();
                    $("#video-player").html("<iframe width='853' height='480' src='https://www.youtube.com/embed/" + trailerResponse.results[0].key + "' frameborder='0' allowfullscreen></iframe>'");
                    $("#video-player").append("<button id='close-button' class='close-trailer'>✘</button>");
                }

                else {
                    trailerError();
                }
            })

            .fail(function () {
                trailerError();
            })

            .always(function (trailerResponse) {
                console.log(trailerResponse);
            });

    });

    // Close video on click
    $(document).on("click", ".close-trailer", function () {

        $("#video-background").hide();
        $("#video-player").hide();
        $("#video-player").html("");

    });

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
            poster: $(this).attr("data-poster")
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