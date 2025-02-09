let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
const wishlistContainer = document.querySelector(".wishlist");

const getBooks = async (book) => {
  const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${book}`
  );
  const data = await response.json();
  return data;
};

const extractThumbnail = ({ imageLinks }) => {
  const DEFAULT_THUMBNAIL = "icons/logo.svg";
  if (!imageLinks || !imageLinks.thumbnail) {
    return DEFAULT_THUMBNAIL;
  }
  return imageLinks.thumbnail.replace("http://", "https://");
};

const addToWishlist = (book) => {
  if (!wishlist.some(item => item.id === book.id)) {
    wishlist.push(book);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    renderWishlist();
  }
};

const renderWishlist = () => {
  wishlistContainer.innerHTML = wishlist.length === 0 ? "<div class='prompt'>No books in wishlist</div>" : wishlist
      .map(
          book => `<div class='book' style='background: linear-gradient(${getRandomColor()}, rgba(0, 0, 0, 0));'>
                  <a href='${book.previewLink}' target='_blank'><img class='thumbnail' src='${book.thumbnail}' alt='cover'></a>
                  <div class='book-info'>
                    <h3 class='book-title'><a href='${book.previewLink}' target='_blank'>${book.title}</a></h3>
                    <div class='book-authors'>${book.authors}</div>
                    <button class='remove-btn styled-btn' onclick='removeFromWishlist("${book.id}")'>Remove</button>
                  </div>
                </div>`
      ).join("");
};

const removeFromWishlist = (id) => {
  wishlist = wishlist.filter(book => book.id !== id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderWishlist();
};

const drawChartBook = async (subject, startIndex = 0) => {
  let cbookContainer = document.querySelector(`.${subject}`);
  cbookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
  const cdata = await getBooks(
      `subject:${subject}&startIndex=${startIndex}&maxResults=6`
  );
  if (cdata.error) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
  } else if (cdata.totalItems == 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
  } else if (!cdata.items || cdata.items.length == 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ There is no more result!</div>`;
  } else {
    cbookContainer.innerHTML = cdata.items
        .map(({ id, volumeInfo }) => {
          const book = {
            id,
            title: volumeInfo.title,
            authors: volumeInfo.authors || "Unknown",
            thumbnail: extractThumbnail(volumeInfo),
            previewLink: volumeInfo.previewLink
          };
          return `<div class='book' style='background: linear-gradient(${getRandomColor()}, rgba(0, 0, 0, 0));'>
                  <a href='${book.previewLink}' target='_blank'><img class='thumbnail' src='${book.thumbnail}' alt='cover'></a>
                  <div class='book-info'>
                    <h3 class='book-title'><a href='${book.previewLink}' target='_blank'>${book.title}</a></h3>
                    <div class='book-authors'>${book.authors}</div>
                    <button class='wishlist-btn styled-btn' onclick='addToWishlist(${JSON.stringify(book)})'>Add to Wishlist</button>
                  </div>
                </div>`;
        })
        .join("");
  }
};
const drawListBook = async () => {
  if (searchBooks.value != "") {
    bookContainer.style.display = "flex";
    bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
    const data = await getBooks(`${searchBooks.value}&maxResults=6`);
    if (data.error) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
    } else if (data.totalItems == 0) {
      bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
    } else {
      bookContainer.innerHTML = data.items
          .map(({ id, volumeInfo }) => {
            const book = {
              id,
              title: volumeInfo.title,
              authors: volumeInfo.authors || "Unknown",
              thumbnail: extractThumbnail(volumeInfo),
              previewLink: volumeInfo.previewLink
            };
            return `<div class='book' style='background: linear-gradient(${getRandomColor()}, rgba(0, 0, 0, 0));'>
                    <a href='${book.previewLink}' target='_blank'><img class='thumbnail' src='${book.thumbnail}' alt='cover'></a>
                    <div class='book-info'>
                      <h3 class='book-title'><a href='${book.previewLink}' target='_blank'>${book.title}</a></h3>
                      <div class='book-authors'>${book.authors}</div>
                      <button class='wishlist-btn styled-btn' onclick='addToWishlist(${JSON.stringify(book)})'>Add to Wishlist</button>
                    </div>
                  </div>`;
          })
          .join("");
    }
  } else {
    bookContainer.style.display = "none";
  }
};
const updateFilter = ({ innerHTML }, f) => {
  document.getElementById("main").scrollIntoView({
    behavior: "smooth",
  });
  let m;
  switch (f) {
    case "author":
      m = "inauthor:";
      break;
    case "subject":
      m = "subject:";
      break;
  }
  searchBooks.value = m + innerHTML;
  debounce(drawListBook, 1000);
};
const debounce = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListBook, time));
};
searchBooks.addEventListener("input", () => debounce(drawListBook, 1000));
document.addEventListener("DOMContentLoaded", () => {
  drawChartBook("love");
  drawChartBook("feminism");
  drawChartBook("inspirational");
  drawChartBook("authors");
  drawChartBook("fiction");
  drawChartBook("poetry");
  drawChartBook("fantasy");
  drawChartBook("romance");
  renderWishlist();
});
let mainNavLinks = document.querySelectorAll(".scrolltoview");
window.addEventListener("scroll", (event) => {
  let fromTop = window.scrollY + 64;
  mainNavLinks.forEach(({ hash, classList }) => {
    let section = document.querySelector(hash);
    if (
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
    ) {
      classList.add("current");
    } else {
      classList.remove("current");
    }
  });
});
const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}40`;
const toggleSwitch = document.querySelector(
    '.theme-switch input[type="checkbox"]'
);
if (localStorage.getItem("marcdownTheme") == "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#090b28");
  toggleSwitch.checked = true;
  localStorage.setItem("marcdownTheme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
  document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#ffffff");
  toggleSwitch.checked = false;
  localStorage.setItem("marcdownTheme", "light");
}
const switchTheme = ({ target }) => {
  if (target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    document
        .querySelector("meta[name=theme-color]")
        .setAttribute("content", "#090b28");
    localStorage.setItem("marcdownTheme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document
        .querySelector("meta[name=theme-color]")
        .setAttribute("content", "#ffffff");
    localStorage.setItem("marcdownTheme", "light");
  }
};
toggleSwitch.addEventListener("change", switchTheme, false);
let startIndex = 0;
const next = (subject) => {
  startIndex += 6;
  if (startIndex >= 0) {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  } else {
    document.getElementById(`${subject}-prev`).style.display = "none";
  }
};
const prev = (subject) => {
  startIndex -= 6;
  if (startIndex <= 0) {
    startIndex = 0;
    drawChartBook(subject, startIndex);
    document.getElementById(`${subject}-prev`).style.display = "none";
  } else {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  }
};
const modal = document.querySelector(".modal");
const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");
const toggleModal = () => modal.classList.toggle("show-modal");
const windowOnClick = ({ target }) => {
  if (target === modal) {
    toggleModal();
  }
};
trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
let pwaInstalled = localStorage.getItem("pwaInstalled") == "yes";
if (window.matchMedia("(display-mode: standalone)").matches) {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
}
if (window.navigator.standalone === true) {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
}
if (pwaInstalled) {
  document.getElementById("installPWA").style.display = "none";
} else {
  document.getElementById("installPWA").style.display = "inline-flex";
}
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  deferredPrompt = e;
});
window.addEventListener("appinstalled", (evt) => {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
  document.getElementById("installPWA").style.display = "none";
});