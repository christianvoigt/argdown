document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    var argdownSnippets = document.querySelectorAll(".argdown-snippet");
    argdownSnippets.forEach(function(snippet) {
      var currentSnippet = snippet;
      var mapButton = snippet.querySelector(".button.map");
      mapButton.addEventListener("click", function(e) {
        currentSnippet.classList.add("map-active");
        currentSnippet.classList.remove("source-active");
        e.preventDefault();
      });
      var sourceButton = snippet.querySelector(".button.source");
      sourceButton.addEventListener("click", function(e) {
        currentSnippet.classList.add("source-active");
        currentSnippet.classList.remove("map-active");
        e.preventDefault();
      });
    });
  }, 3000);
});
