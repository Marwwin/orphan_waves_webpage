const http = require("http");
const fs = require("fs");
const path = require("path");

const albums = [
  {
    name: "Keel",
    year: 2024,
    album_cover: "keel_small.jpeg",
    mixed_by: "Orphan Waves",
    recorded_by: "Joonatan Turkki",
    recorded_at: "Magnusborg Studios",
    mastered_by: "Orphan Waves",
    cover_art: "Riku Lekman",
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
    mixed_by: "Orphan Waves",
    recorded_at: "Hollywood House Studios",
    recorded_by: "Matias Kiiveri",
    mastered_by: "Robin Sutherland",
    mastered_at: "Esko Mastering",
    cover_art: "Toimi Tytti",
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
    mixed_by: "Orphan Waves",
    recorded_at: "Soundwell Studios",
    recorded_by: "Valtteri Kallio",
    mastered_by: "Robin Sutherland",
    mastered_at: "Esko Mastering",
    cover_art: "Dall-e",
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
    mixed_by: "Orphan Waves",
    recorded_at: "Altai Studios",
    recorded_by: "Tuomas Paavola",
    mastered_by: "Robin Sutherland",
    mastered_at: "Esko Mastering",
    cover_art: "Leonor Ruiz Dubrovin",
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

app.listen(3001, "localhost", () => {
  console.log("running on", 3001);
});

function createAlbum(index) {
  const album = albums[index];
  const newestAlbum = Math.max(...albums.map((e) => e.year));
  const header =
    newestAlbum === album.year ? `New EP "${album.name}" Out Now!` : album.name;
  const limit = albums.length - 1;

  return `
    <section id="album" data-theme="theme-${album.name.toLowerCase()}">
      ${
        index > 0
          ? `
          <div class="arrow left"
            hx-get="/album/${index - 1}"
            hx-target="closest section"
            hx-swap="outerHTML swap:500ms"
      >&lt;</div> `
          : ""
       }
      <div id="album_container">
        <div id="album_cover">
          <img id="album_cover_img" alt="Album cover" src="./assets/${album.album_cover}" />
          <div id="album_info">
            <h2>${album.name}</h2>

            <div>
              <h3>Tracks:</h3>
              <ol>
                ${album.tracks.map((track) => `<li>${track.name}</li>`).join("")}
              </ol>
            </div>
          <div id="album_personel">
            <ul>
            <li>Released: ${album.year}
            <li>Recorded by: ${album.recorded_by} @ ${album.recorded_at}</li>
            <li>Mixed by: ${album.mixed_by}</li>
            <li>Mastered by: ${album.mastered_by} ${album.mastered_at ? `@ ${album.mastered_at}` : ""} </li>
            <li>Cover art by: ${album.cover_art}</li>
            </ul>
            </div>
        <div id="album_links">
          <a href="${album.spotify_link}" >
            <img
              id="spotify_logo"
              alt="Spotify logo"
              src="./assets/Spotify_Logo_CMYK_White.png"
          /></a>
          <a href="${album.youtube_link}" >
            <img
              id="youtube_logo"
              alt="Youtube logo"
              src="assets/yt_logo_mono_dark.png"
          /></a>
          </div>
          </div>
        </div>
        </div>
      ${
        index < limit
          ? `
          <div class="arrow right"
            hx-get="/album/${index + 1}"
            hx-target="closest section"
            hx-swap="outerHTML swap:500ms"
      >&gt;</div> `
          : ""
      }
    </section>
`;
}
