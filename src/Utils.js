function generateRandomId (opts) {
  opts = Object.assign({}, opts);
  let id = parseInt(1e6 * Math.random(), 10);
  if (opts.prefix != null) {
    id = `${opts.prefix}${id}`;
  }
  return id;
}

export default {
  generateRandomId,
};
