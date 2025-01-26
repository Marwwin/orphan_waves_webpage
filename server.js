const http = require("http");
const fs = require("fs");
const path = require("path");

const albums = [
  {
    name: "Keel",
    year: 2024,
    album_cover: "keel_small.jpeg",
    spotify_link: "https://open.spotify.com/album/5NI1GQeK5u2FTIEM4N3jZn",
    youtube_link:
      "https://www.youtube.com/playlist?list=OLAK5uy_lRYRwp44y8OECnYgbsVEyQaL_I_fiSndE",
    tracks: [
      { name: "Undress" },
      { name: "Forty" },
      { name: "Secrets" },
      { name: "Divide" },
    ],
  },
  {
    name: "Persona",
    year: 2023,
    album_cover: "persona_small.jpeg",
    spotify_link:
      "https://open.spotify.com/album/6QW6mXroON0hVTL11Cs1W3?si=Ral12uJJSRm6-NhLUU7G4Q",
    youtube_link:
      "https://youtube.com/playlist?list=OLAK5uy_ljdsq_2qV6PJRS0HjoIgHeiPVklb_qROY&si=TnnYfR7aE1RUYK_k",
    tracks: [
      { name: "Heroes" },
      { name: "Rabbit" },
      { name: "Ejection Seat" },
      { name: "Troubles" },
    ],
  },
  {
    name: "Caveat",
    year: 2022,
    album_cover: "caveat_small.jpeg",
    spotify_link:
      "https://open.spotify.com/album/6QW6mXroON0hVTL11Cs1W3?si=Ral12uJJSRm6-NhLUU7G4Q",
    youtube_link:
      "https://www.youtube.com/playlist?list=OLAK5uy_llw6VgmAkbMrquc1NY2RKBwm8VmS_AipE",
    tracks: [
      { name: "Fuse" },
      { name: "Isolations" },
      { name: "Pattern" },
      { name: "Flycatcher" },
    ],
  },
  {
    name: "Soirée",
    album_cover: "soiree_small.jpeg",
    year: 2021,
    spotify_link: "https://open.spotify.com/album/2yEG4NOFZye0sfTNIcNtrv",
    youtube_link:
      "https://www.youtube.com/playlist?list=OLAK5uy_lqkLDYwZogOB7BVfmYCtylQbRjh7WeTJc",
    tracks: [
      { name: "Discordia" },
      { name: "Weather Vane" },
      { name: "Charles' Town" },
      { name: "Snowstorm" },
    ],
  },
];

const app = http.createServer(async (req, res) => {
  /**
   * CORS Stuff
   **/
  const allowedOrigins = [
    "http://localhost",
    "http://37.27.21.206",
    "http://2a01:4f9:c012:b308::/64",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  /**
   *  Endpoints
   **/
  const url = req.url.split("/");
  console.log(url);

  if (url[1] === "album") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(createAlbum(parseInt(url[2])));
    res.end();
  } else if (req.url === "/gigs") {
    fetch(
      "https://docs.google.com/spreadsheets/d/1f9suJQaZPN_tezfapoUc_nNyuitzCVrtJ3tPATJ1o50/export?format=csv",
    )
      .then((response) => response.text())
      .then((gigsCsv) =>
        gigsCsv.split("\r\n").map((gig) => {
          const [name, city, date] = gig.split(",");
          const [day, month, year] = date.split(".");
          return {
            html: `<div class="gig"><span class="place">${name} ${city}</span><span class="time">${date}</span></div>`,
            time: new Date(year, month - 1, day).getTime(),
            gone: Date.now() > new Date(year, month - 1, day).getTime(),
          };
        }),
      )
      .catch(() => {
        const filePath = path.join(__dirname, "gigs.html");
        return fs.readFileSync(filePath, { encoding: "utf8" });
      })
      .then((gigs) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        if (typeof gigs === "string") {
          res.write(gigs);
        } else {
          const gones = gigs.filter((gig) => gig.gone);
          const upcoming = gigs.filter((gig) => !gig.gone);

          const html = `<h2>Gigs</h2>
                        <h3>Upcoming</h3>
                        ${upcoming
                          .sort((a, b) => a.time - b.time)
                          .reduce((acc, gig) => (acc += gig.html + "\n"), "")}
                        <h3>Gone</h3>
                        ${gones
                          .sort((a, b) => b.time - a.time)
                          .reduce((acc, gig) => (acc += gig.html + "\n"), "")}`;

          fs.writeFileSync("gigs.html", html, "utf8");
          res.write(html);
        }
        res.end();
        return;
      })
      .catch((err) => console.log(err));
  } else {
    /**
     * Load assets
     * */

    let filePath = "." + req.url;
    if (filePath === "./") {
      filePath = "./index.html";
    }

    const extname = path.extname(filePath);
    let contentType = "text/html";

    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".jpg":
        contentType = "image/jpg";
        break;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code == "ENOENT") {
          res.writeHead(404);
          res.end("File not found");
        } else {
          res.writeHead(500);
          res.end("Server error: " + error.code);
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  }
});

app.listen(3002, "localhost", () => {
  console.log("running on", 3002);
});

function createAlbum(index) {
  const album = albums[index];
  const newestAlbum = Math.max(...albums.map((e) => e.year));
  const header =
    newestAlbum === album.year ? `New EP "${album.name}" Out Now!` : album.name;
  const limit = albums.length - 1;
  console.log(album.tracks);

  return `
    <section id="album" data-theme="theme-${album.name.toLowerCase()}">
      ${
        index > 0
          ? `
          <div class="arrow left"
            hx-get="/album/${index - 1}"
            hx-target="closest section"
            hx-swap="outerHTML"
      >&lt;</div> `
          : ""
      }
      <div id="album_container">
      <h2>Albums</h2>
        <div id="album_cover">
          <img alt="Album cover" src="./assets/${album.album_cover}" />
          <div id="album_info">
            <h3>${album.name}</h3>
            <ul>
              ${album.tracks.map((track) => `<li>${track.name}</li>`).join('')}
            </ul>
          </div>
        </div>      <div id="album_links">
              <a href="${album.spotify_link}" >
                <img
                  id="spotify_logo"
                  alt="Spotify logo"
                  src="./assets/Spotify_Logo_CMYK_White.png"
              /></a>
              <a
                href="${album.youtube_link}"
              >
                <img
                  id="youtube_logo"
                  alt="Youtube logo"
                  src="assets/yt_logo_mono_dark.png"
              /></a>
            </div>
            </div>
      ${
        index < limit
          ? `
          <div class="arrow right"
            hx-get="/album/${index + 1}"
            hx-target="closest section"
            hx-swap="outerHTML swap:300ms"

      >&gt;</div> `
          : ""
      }
    </section>
`;
}
