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
