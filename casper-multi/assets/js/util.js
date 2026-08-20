function getSelectedLanguage() {
  return localStorage.getItem("selectedLanguage") || "en";
}

function updateLink(selector, language) {
  const element = document.querySelector(selector);
  if (element) {
    let siteUrl = element.getAttribute("href");
    if (!siteUrl.endsWith("/")) {
      siteUrl += "/";
    }
    element.setAttribute("href", `${siteUrl}${language}/`);
  }
}

function filterArchivePostsByLanguage() {
  const supportedLanguages = ["en", "ko"];
  const selectedLanguage = getSelectedLanguage();
  const postCards = document.querySelectorAll("div.post-card[data-tags]");
  let visibleCount = 0;

  postCards.forEach((card) => {
    let tagNames = [];

    try {
      tagNames = JSON.parse(card.getAttribute("data-tags") || "[]");
    } catch (error) {
      tagNames = [];
    }

    const cardLanguage = supportedLanguages.find((language) =>
      tagNames.includes(`#${language}`)
    );

    if (cardLanguage !== selectedLanguage) {
      card.style.display = "none";
      return;
    }

    visibleCount += 1;
    setTimeout(() => {
      card.style.opacity = 1;
      card.querySelectorAll(".post-card-excerpt").forEach((excerpt) => {
        excerpt.style.opacity = 1;
      });
    }, 10);
  });

  return visibleCount;
}
