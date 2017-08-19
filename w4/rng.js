const range = (start, end, step = 1) => {
  const iterable = {};

  iterable[Symbol.iterator] = function*() {
    let index = start;
    while(index < end) {
      index += step;
      yield index;
    }
  };

  return iterable;
};

const arange = (start, end, step) => [...range(start, end, step)];
