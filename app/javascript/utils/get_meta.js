// Reads a <meta name="..." content="..."> value — used to pull the CSRF
// token that csrf_meta_tags rendered into the shell's <head>.
function getMeta(name) {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content');
}

export default getMeta;
