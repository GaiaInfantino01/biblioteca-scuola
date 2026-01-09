{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const sheetURL =\
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";\
\
const search = document.getElementById("search");\
const resultsList = document.getElementById("results");\
const loading = document.getElementById("loading");\
const count = document.getElementById("count");\
const onlyAvailable = document.getElementById("only-available");\
const filterAuthor = document.getElementById("filter-author");\
const filterGenre = document.getElementById("filter-genre");\
const sortSelect = document.getElementById("sort");\
\
const modal = document.getElementById("modal");\
const modalBody = document.getElementById("modal-body");\
const closeModal = document.getElementById("close-modal");\
\
let books = [];\
let debounceTimer;\
\
/* UTIL */\
const safe = v => v && v.trim() !== "" ? v : "\'97";\
\
const highlight = (text, q) =>\
  q ? text.replace(new RegExp(`($\{q\})`, "gi"), "<mark>$1</mark>") : text;\
\
/* MODAL */\
closeModal.onclick = () => modal.classList.add("hidden");\
modal.onclick = e => \{ if (e.target === modal) modal.classList.add("hidden"); \};\
\
/* PARSE CSV */\
Papa.parse(sheetURL, \{\
  download: true,\
  header: true,\
  skipEmptyLines: true,\
  complete: res => \{\
    books = res.data;\
    loading.style.display = "none";\
    populateFilters();\
  \}\
\});\
\
/* FILTRI */\
function populateFilters() \{\
  const authors = [...new Set(books.map(b => b.AUTORE).filter(Boolean))].sort();\
  const genres = [...new Set(books.map(b => b.GENERE).filter(Boolean))].sort();\
\
  authors.forEach(a =>\
    filterAuthor.innerHTML += `<option value="$\{a\}">$\{a\}</option>`\
  );\
\
  genres.forEach(g =>\
    filterGenre.innerHTML += `<option value="$\{g\}">$\{g\}</option>`\
  );\
\}\
\
/* RENDER */\
function render() \{\
  const q = search.value.toLowerCase().trim();\
  const words = q.split(" ").filter(Boolean);\
\
  let filtered = books.filter(b => \{\
    const text = `$\{b.TITOLO\} $\{b.AUTORE\} $\{b.GENERE\} $\{b.ISBN\}`.toLowerCase();\
    const matchesText = words.every(w => text.includes(w));\
    const matchesAuthor = !filterAuthor.value || b.AUTORE === filterAuthor.value;\
    const matchesGenre = !filterGenre.value || b.GENERE === filterGenre.value;\
\
    const disponibile =\
      (b.DISPONIBILITA || "").toLowerCase() === "disponibile";\
\
    return matchesText &&\
           matchesAuthor &&\
           matchesGenre &&\
           (!onlyAvailable.checked || disponibile);\
  \});\
\
  /* ORDINAMENTO */\
  switch (sortSelect.value) \{\
    case "author":\
      filtered.sort((a,b) => a.AUTORE.localeCompare(b.AUTORE));\
      break;\
    case "year-asc":\
      filtered.sort((a,b) => (a.ANNO||0) - (b.ANNO||0));\
      break;\
    case "year-desc":\
      filtered.sort((a,b) => (b.ANNO||0) - (a.ANNO||0));\
      break;\
    default:\
      filtered.sort((a,b) => a.TITOLO.localeCompare(b.TITOLO));\
  \}\
\
  resultsList.innerHTML = "";\
  count.textContent = filtered.length\
    ? `$\{filtered.length\} risultati trovati`\
    : "";\
\
  filtered.forEach(book => \{\
    const li = document.createElement("li");\
    li.className = "book-item";\
\
    const disponibile =\
      (book.DISPONIBILITA || "").toLowerCase() === "disponibile";\
\
    li.classList.add(disponibile ? "disponibile-border" : "non-disponibile-border");\
\
    li.innerHTML = `\
      <strong>$\{highlight(safe(book.TITOLO), q)\}</strong><br>\
      $\{highlight(safe(book.AUTORE), q)\} \'96 $\{safe(book.EDITORE)\} ($\{safe(book.ANNO)\})\
    `;\
\
    li.onclick = () => \{\
      modalBody.innerHTML = `\
        <h2>$\{safe(book.TITOLO)\}</h2>\
        <p><strong>Autore:</strong> $\{safe(book.AUTORE)\}</p>\
        <p><strong>Editore:</strong> $\{safe(book.EDITORE)\}</p>\
        <p><strong>Anno:</strong> $\{safe(book.ANNO)\}</p>\
        <p><strong>Genere:</strong> $\{safe(book.GENERE)\}</p>\
        <p><strong>ISBN:</strong> $\{safe(book.ISBN)\}</p>\
        <p><strong>Disponibilit\'e0:</strong> $\{safe(book.DISPONIBILITA)\}</p>\
        <hr>\
        <p>$\{safe(book.ABSTRACT)\}</p>\
      `;\
      modal.classList.remove("hidden");\
    \};\
\
    resultsList.appendChild(li);\
  \});\
\}\
\
/* DEBOUNCE */\
function debouncedRender() \{\
  clearTimeout(debounceTimer);\
  debounceTimer = setTimeout(render, 200);\
\}\
\
[search, filterAuthor, filterGenre, sortSelect, onlyAvailable]\
  .forEach(el => el.addEventListener("input", debouncedRender));\
}