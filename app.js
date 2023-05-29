require("dotenv").config();

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const express = require("express");
const hbs = require("hbs");
const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.searchArtistName)
    .then((data) => {
      //console.log("The received data from the API: ", data.body.artists);
      res.render("artist-search-results", {
        artists: data.body.artists.items,
        SearchedTerms: req.query.searchArtistName,
      });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res, next) => {
  Promise.all([
    spotifyApi.getArtist(req.params.artistId),
    spotifyApi.getArtistAlbums(req.params.artistId),
  ])
    .then(([data, artistAlbum]) => {
      const artistName = data.body.name;
      const albums = artistAlbum.body.items;
      res.render("albums", { albums: albums, artistName: artistName });
    })
    .catch((err) => console.log(err));
});

app.get("/tracks-info/:albumId", (req, res, next) => {
  Promise.all([
    spotifyApi.getAlbum(req.params.albumId),
    spotifyApi.getAlbumTracks(req.params.albumId),
  ])
    .then(([albumData, trackData]) => {
      const albumName = albumData.body.name;
      const tracks = trackData.body.items;
      res.render("tracks-info", {
        tracks: tracks,
        albumName: albumName,
      });
    })
    .catch((err) => console.log(err));
  //console.log(req.params);
  //   let albumName;
  //   spotifyApi
  //     .getAlbum(req.params.albumId)
  //     .then((data) => {
  //       albumName = data.body.name;
  //     })
  //     .catch((err) => console.log(err));

  //   let tracks;
  //   spotifyApi
  //     .getAlbumTracks(req.params.albumId)
  //     .then((data) => {
  //       //console.log(data);
  //       tracks = data.body.items;
  //     })
  //     .catch((err) => console.log("The error while search albums: ", err));
});
