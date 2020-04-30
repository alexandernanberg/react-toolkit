/**
 * Concat and flattens non-null values.
 * Ex: concat(1, undefined, 2, [3, 4]) = [1, 2, 3, 4]
 */
function concat(...args) {
  return args.flat(3).filter((i) => i != null)
}

/**
 * Dedupes array based on criterion returned from iteratee function.
 * Ex: uniqueBy(
 *     [{ id: 1 }, { id: 1 }, { id: 2 }],
 *     val => val.id
 * ) = [{ id: 1 }, { id: 2 }]
 */
function uniqueBy(arr, fun) {
  const seen = {}
  return arr.filter((el) => {
    const e = fun(el)
    // eslint-disable-next-line no-return-assign
    return !(e in seen) && (seen[e] = 1)
  })
}

module.exports = {
  concat,
  uniqueBy,
}
