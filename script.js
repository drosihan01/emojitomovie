// 🎬 Emoji-to-movie recommendations (only for supported ones)
const emojiMovieMap = {
  "😂": [
    { title: "Superbad", desc: "Teen chaos, wild laughs." },
    { title: "Step Brothers", desc: "Grown men acting 12." }
  ],
  "😢": [
    { title: "Marley & Me", desc: "Dog + sadness = pain." },
    { title: "The Pursuit of Happyness", desc: "Cried in public." }
  ],
  "🔥": [
    { title: "John Wick", desc: "Nonstop action 🔥." },
    { title: "Mad Max: Fury Road", desc: "Wasteland heat and chaos." }
  ],
  "👻": [
    { title: "The Conjuring", desc: "Classic haunted house." },
    { title: "Insidious", desc: "Demon hide-and-seek energy." }
  ],
  "🍿": [
    { title: "Avengers: Endgame", desc: "Peak popcorn flick." },
    { title: "Everything Everywhere All At Once", desc: "Wild multiverse ride." }
  ],
  "🤯": [
    { title: "Inception", desc: "Dreams inside dreams." },
    { title: "Tenet", desc: "Time goes brrr." }
  ],
  "😎": [
    { title: "Ocean’s Eleven", desc: "Slick heist energy." },
    { title: "Top Gun: Maverick", desc: "Cool jets and cooler dudes." }
  ]
};

let emojiList = []; // global emoji search list

// 🧠 Fetch emoji dataset from GitHub
fetch('https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json')
  .then(res => res.json())
  .then(data => {
    emojiList = data.filter(e => e.emoji); // remove entries without emoji char
    const withTags = emojiList.filter(e => Array.isArray(e.tags) && e.tags.length > 0);
    console.log("Total with tags:", withTags.length);
    console.log("Sample with tags:", withTags.slice(0, 5));
    setupSearch();
    renderRandomEmojis(emojiList);
  });

// 🔍 Setup search bar logic
function setupSearch() {
  const input = document.getElementById("emoji-search");
  const results = document.getElementById("emoji-results");
  const randomEmojiSection = document.getElementById("random-emojis");

  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    // Toggle emoji grid
    if (query.length > 0) {
      randomEmojiSection.classList.add("hidden");
    } else {
      randomEmojiSection.classList.remove("hidden");
      results.innerHTML = "";
      return;
    }

    // Smart tag match (partial and fuzzy)
    const smartMatches = emojiList.filter(e =>
        (typeof e.emoji === "string" && e.emoji.includes(query)) ||
        (typeof e.description === "string" && e.description.toLowerCase().includes(query)) ||
        (Array.isArray(e.aliases) && e.aliases.some(alias => alias.toLowerCase().includes(query))) ||
        (Array.isArray(e.tags) && e.tags.some(tag => tag.toLowerCase().includes(query)))
    );


    const topResults = smartMatches.slice(0, 12);
    results.innerHTML = "";

    if (topResults.length === 0) {
      results.innerHTML = "<p>No emoji match found 👀</p>";
      return;
    }

    topResults.forEach(e => {
      const btn = document.createElement("button");
      btn.textContent = `${e.emoji} – ${e.description || "No description"}`;
      btn.style.display = "block";
      btn.style.margin = "8px auto";
      btn.style.fontSize = "1.2rem";
      btn.style.padding = "10px 16px";
      btn.style.border = "1px solid #e5e7eb";
      btn.style.borderRadius = "12px";
      btn.style.background = "#fff";
      btn.style.cursor = "pointer";
      btn.onclick = () => handleEmojiClick(e.emoji);
      results.appendChild(btn);
    });
  });
}



// 📽️ Show movie result or fallback
function handleEmojiClick(emoji) {
  const movieList = emojiMovieMap[emoji];
  const resultDiv = document.getElementById("movie-result");
  const emojiSection = document.getElementById("emoji-section");

  // Hide emojis, show result
  emojiSection.classList.add("hidden");
  resultDiv.classList.remove("hidden");

  // If movies exist for this emoji
  if (movieList && movieList.length > 0) {
    const movie = movieList[Math.floor(Math.random() * movieList.length)];

    fetchMoviePoster(movie.title).then(tmdb => {
    resultDiv.innerHTML = `
    <div style="text-align: right;">
      <button onclick="resetEmojiView()" style="
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
      ">✖</button>
    </div>
    <img src="${tmdb.poster}" alt="${tmdb.title} Poster" style="max-width:200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); margin-bottom: 16px;">
    <h2>${tmdb.title} (${tmdb.year})</h2>
    <p><em>IMDb Rating: ${tmdb.rating}</em></p>
    <p>${tmdb.plot}</p>
    <p>
      <a href="${tmdb.trailerLink}" target="_blank" style="
        display: inline-block;
        margin: 10px 0;
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      ">▶️ Watch Trailer on YouTube</a>
    </p>
    <p><strong>Does this match the emoji?</strong></p>
    <button onclick="rateMovie('${emoji}', '${tmdb.title}', true)">👍 Yes</button>
    <button onclick="rateMovie('${emoji}', '${tmdb.title}', false)">👎 No</button>
    <div class="vote-bar" id="vote-bar-${emoji}-${tmdb.title.replace(/\s/g, '')}" style="margin-top:16px;"></div>
    `;
    });


  } else {
    // No movie match yet
    resultDiv.innerHTML = `
    <div style="text-align: right;">
    <button onclick="resetEmojiView()" style="
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    ">✖</button>
    </div>
    <p>🤔 No movie match yet for ${emoji}</p>
    <p>More matches coming soon.</p>
    `;
  }
}




// 🗳️ Handle feedback and show results
function rateMovie(emoji, title, isPositive) {
  const key = `${emoji}_${title}`;
  const existing = JSON.parse(localStorage.getItem(key)) || { yes: 0, no: 0 };

  if (isPositive) {
    existing.yes += 1;
  } else {
    existing.no += 1;
  }

  localStorage.setItem(key, JSON.stringify(existing));

  const totalVotes = existing.yes + existing.no;
  const yesPercent = Math.round((existing.yes / totalVotes) * 100);
  const noPercent = 100 - yesPercent;

  const resultDiv = document.getElementById("movie-result");
  resultDiv.innerHTML += `
    <p>✅ <strong>${yesPercent}% Yes</strong> &nbsp;&nbsp; ❌ <strong>${noPercent}% No</strong></p>
    <div style="width: 100%; background: #eee; height: 24px; border-radius: 6px; overflow: hidden;">
      <div style="width: ${yesPercent}%; height: 100%; background: #22c55e; float: left;"></div>
      <div style="width: ${noPercent}%; height: 100%; background: #ef4444; float: left;"></div>
    </div>
    <p style="font-size: 0.8rem; color: #666;">${totalVotes} total votes</p>
  `;
}

function renderRandomEmojis(list, count = 30) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  const selection = shuffled.slice(0, count);

  const container = document.getElementById("random-emojis");
  container.innerHTML = "";

  selection.forEach((e) => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn"; // 👈 use a CSS class
    btn.textContent = e.emoji;
    btn.title = e.description || "";
    btn.addEventListener("click", () => handleEmojiClick(e.emoji));
    container.appendChild(btn);
  });
}


function fetchMoviePoster(title) {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=c7cc0527`;

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        return {
          title: data.Title,
          poster: data.Poster,
          plot: data.Plot,
          year: data.Year,
          rating: data.imdbRating,
          trailerLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(data.Title + " trailer")}`
        };
      } else {
        throw new Error("Movie not found in OMDb.");
      }
    });
}

function resetEmojiView() {
  const resultDiv = document.getElementById("movie-result");
  const emojiSection = document.getElementById("emoji-section");
  const randomEmojiGrid = document.getElementById("random-emojis");
  const emojiSearchInput = document.getElementById("emoji-search");
  const emojiResults = document.getElementById("emoji-results");

  // Hide result, show emoji section
  resultDiv.classList.add("hidden");
  emojiSection.classList.remove("hidden");

  // Clear search
  emojiSearchInput.value = "";
  emojiResults.innerHTML = "";

  // Bring back the grid (in case it was hidden from search)
  randomEmojiGrid.classList.remove("hidden");
}

