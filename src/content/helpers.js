/**
 * Factory for a node action which is performed when predicate returns true.
 */
export const test = (predicate, action) => (node) => {
  if (predicate(node)) {
    action(node);
  }
};

/**
 * Decorator for negating the output of a boolean function
 */
export function not(fn) {
  return function () {
    return !fn(...arguments);
  };
}

/**
 * Pipe together all the functions taking the same argument as the top level.
 * Useful for splitting up callbacks into separate semantic units.
 */
export function doAll(fns, predicate = () => true) {
  return function () {
    if (predicate(...arguments)) fns.forEach((fn) => fn(...arguments));
  };
}

/**
 * Find a stylesheet with a given title
 */
export function getStyleSheet(title) {
  for (var i = 0; i < document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.title == title) {
      return sheet;
    }
  }
}

/**
 * Test to see if a string is only whitespace
 * TODO: Does it? I hate regex....
 */
export function onlyWhitespace(str) {
  return !/\S/.test(str);
}

/**
 * Curried function for adding a classname to a node's parentNode
 */
export const addClass = (className) => (node) => {
  return node.parentNode.classList.add(className);
};

/**
 * Curried function for removing a classname to a node's parentNode
 */
export const removeClass = (className) => (node) => {
  return node.parentNode.classList.remove(className);
};

/**
 * Traverse the DOM and collect all the nodes that match criterion objects in
 * the criteria list
 */
export function collectNodes(
  fromRoot,
  criteria,
  collectionObject = [],
  addToObject = (node, object) => object.push(node)
) {
  if (!hasChildren(fromRoot)) return collectionObject;

  fromRoot.childNodes.forEach((node) => {
    if (meets(node, criteria)) {
      addToObject(node, collectionObject);
    }

    collectNodes(node, criteria, collectionObject, addToObject);
  });

  return collectionObject;
}

/**
 * Handles the issue with different nodeTypes having access to different APIs.
 * For example, you may want to predicate node selection on some
 * attributes, but getAttribute isn't defined on all nodes. So you need to be
 * able to define sane behavior.
 */
export function safeWrap(criterion) {
  return (node) => {
    let result;

    try {
      result = criterion.call(node);
    } catch (e) {
      console.error(`${criterion.name} threw: ${e}`);
      return criterion.throwReturn || true;
    }
    return result;
  };
}

/**
 * Use with Array.filter and other things to get only truthy values
 */
export const truthy = id;

function all(collection, predicate) {
  return collection.reduce((acc, el) => {
    return acc && predicate(el);
  });
}

const id = (value) => value;

function meets(node, criteria) {
  const results = criteria.map((predicate) => predicate(node));

  return all(results, truthy);
}

function hasChildren(node) {
  return node.childNodes[0] !== undefined;
}
