/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
class Prng {
  constructor (opts) {
    opts = Object.assign({seed: 1}, opts);
    this._seed = opts.seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
  }

  /**
   * Returns a pseudo-random value between 1 and 2^32 - 2.
   */
  nextInt () {
    return this._seed = this._seed * 16807 % 2147483647;
  }

  /**
   * Returns a pseudo-random floating point number in range [0, 1).
   */
  random () {
    return (this.nextInt() - 1) / 2147483646;
  };

  randomInt (opts) {
    opts = Object.assign({}, opts);
    let {min, max} = opts;
    return Math.floor(min + ((max - min) * this.random()));
  }
}

export default Prng;
