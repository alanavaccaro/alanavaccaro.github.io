const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");

  const md = markdownIt({ html: true, breaks: true });
  eleventyConfig.addFilter("markdownify", (str) => str ? md.render(str) : "");
  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());

  // Extract YouTube ID from various URL formats
  eleventyConfig.addFilter("ytid", (url) => {
    if (!url) return "";
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes",
    },
  };
};
