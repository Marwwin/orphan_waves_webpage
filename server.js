const http = require("http");
const fs = require("fs");
const path = require("path");

const app = http.createServer(async (req, res) => {
  /**
   * CORS Stuff
   **/
  const allowedOrigins = ["http://localhost", "http://37.27.21.206", "http://2a01:4f9:c012:b308::/64"];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
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

  if (req.url === "/gigs") {
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
  console.log("running");
});
