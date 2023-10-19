const startScreen = document.getElementById("startScreen");
const folderList = document.getElementById("folderList");
const fragmentContainer = document.getElementById("fragmentContainer");
const navigation = document.getElementById("navigation");
const pageInput = document.getElementById("pageInput");
const previousPageButton = document.getElementById("previousPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const searchButton = document.getElementById("searchButton");
const searchResultsContainer = document.getElementById("searchResultsContainer");
const searchInput = document.getElementById("searchInput");
const searchContainer = document.getElementById("searchContainer");

const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let selectedFolder = null;
let totalPages = 0;
let currentPage = 1;
let htmlFiles = []
let timeSinceLastClick = 0;

function displayStartScreen(status) {
    startScreen.style.display = status ? "block" : "none";
    pageInput.style.display = status ? "none" : "block";
    fragmentContainer.style.display = status ? "none" : "block";
}

async function getFolders() {
    const response = await fetch('/getFolders');
    const data = await response.json();
    return data.folders;
}

function displayMobileButtons() {
    previousPageButton.style.display = isMobileDevice ? "block" : "none";
    nextPageButton.style.display = isMobileDevice ? "block" : "none";
    searchButton.style.display = isMobileDevice ? "block" : "none";
}

async function getHtmlFileList() {
    const response = await fetch(`/getHtmlFileList?folder=${selectedFolder}`);
    const data = await response.json();
    htmlFiles = data.htmlFiles;
    htmlFiles = htmlFiles.map(htmlFile => htmlFile.split('/').pop());
}

function parseRelativeLinks(content, selectedFolder) {
    const relativeLinkRegex = /(\.\.\/)+/g;
    const baseUrl = `/fragments/${selectedFolder}/`;
    const modifiedContent = content.replace(relativeLinkRegex, baseUrl);
    return modifiedContent;
}

function displayFragment(page) {
    fetch(`/getHtmlFileStream?folder=${selectedFolder}&page=${page}`)
        .then(response => response.text())
        .then(data => {
            const parsedData = parseRelativeLinks(data, selectedFolder);
            fragmentContainer.innerHTML = parsedData;
            pageInput.value = page;
        })
        .catch(error => {
            console.error("Error fetching fragment:", error);
        });
    adjustInputWidth(currentPage);
}

function adjustInputWidth(page) {
    const numDigits = Math.max(1, Math.floor(Math.log10(page) + 1));
    pageInput.style.width = `${numDigits + 0.5}ch`;
}

async function initializeNavigation() {
    await getHtmlFileList();
    totalPages = htmlFiles.length;
    displayFragment(currentPage);
    adjustInputWidth(currentPage);
}

function initializeStartScreen() {
    displayStartScreen(true);
    folderList.innerHTML = "";
    getFolders().then(folders => {
        folders.forEach(folder => {
            const listItem = document.createElement("li");
            listItem.textContent = folder;
            listItem.addEventListener("click", () => {
                selectedFolder = folder;
                displayStartScreen(false);
                displayMobileButtons();
                initializeNavigation();
            });
            folderList.appendChild(listItem);
        });
    });
}

// Listener functions

function toggleNavigation() {
    navigation.style.display = navigation.style.display === "block" ? "none" : "block";
}

function toggleSearchScreen() {
    searchContainer.style.display = searchContainer.style.display === "none" ? "block" : "none";
    previousPageButton.style.display = previousPageButton.style.display == "none" && isMobileDevice ? "block" : "none";
    pageInput.style.display = pageInput.style.display === "none" ? "block" : "none";
    nextPageButton.style.display = nextPageButton.style.display == "none" && isMobileDevice ? "block" : "none";
    searchButton.style.display = searchButton.style.display === "block" && isMobileDevice ? "block" : "none";
    fragmentContainer.style.display = fragmentContainer.style.display === "none" ? "block" : "none";
}

function goToPage() {
    const newPage = parseInt(pageInput.value);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayFragment(currentPage);
    }
}

function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById("searchResultsContainer");

    // Clear any previous results
    searchResultsContainer.innerHTML = "";

    results.forEach(result => {
        const linkElement = document.createElement("li");
        const filename = result.file.split('/').pop();
        linkElement.textContent = `${filename}: ${result.count}`;

        linkElement.addEventListener("click", () => {
            // Find the position of the selected search result in the array of HTML files by filename
            const position = htmlFiles.indexOf(filename);

            if (position !== -1) {
                currentPage = position + 1;
                displayFragment(currentPage);
            }
            toggleSearchScreen();
        });

        searchResultsContainer.appendChild(linkElement);
    });
}

// Client-side code for handling the search request
function performSearch(searchText) {
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchText, selectedFolder }),
    })
        .then(response => response.json())
        .then(data => {
            const results = data.results;
            displaySearchResults(results);
        })
        .catch(error => {
            console.error("Error performing search:", error);
        });
}

// Listeners

fragmentContainer.addEventListener("click", event => {
    if (
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.isContentEditable !== true
    ) {
        let currentTime = new Date().getTime();
        if (currentTime - timeSinceLastClick > 300) {
            isMobileDevice ? toggleNavigation() : null;
        }
        timeSinceLastClick = currentTime;
    }
});

document.addEventListener("keydown", event => {
    if (
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.isContentEditable !== true
    ) {
        if (event.key === "ArrowLeft" || event.key === "h") {
            if (currentPage > 1) {
                currentPage--;
                displayFragment(currentPage);
            }
        } else if (event.key === "ArrowRight" || event.key === "l") {
            if (currentPage < totalPages) {
                currentPage++;
                displayFragment(currentPage);
            }
        }
    }
});

document.addEventListener("keyup", event => {
    if (
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.isContentEditable !== true
    ) {
        if (event.key === "s") {
            startScreen.style.display === "none" ? toggleSearchScreen() : null;
        } else if (event.key === "m") {
            toggleNavigation();
        }
    }
});

pageInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        goToPage();
    }
});

searchInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        const searchText = searchInput.value.trim();
        if (searchText) {
            performSearch(searchText);
        }
    }
});

searchButton.addEventListener("click", () => {
    toggleSearchScreen();
});

previousPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayFragment(currentPage);
    }
});

nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        displayFragment(currentPage);
    }
});

initializeStartScreen();
