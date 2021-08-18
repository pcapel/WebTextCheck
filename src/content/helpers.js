export function log() {
  console.debug(...arguments);
}

export function isText(node) {
  return node.nodeType === 3;
}

export function parentAttrIs(attrName, value) {
  return function (node) {
    return parent(node).getAttribute(attrName) === value;
  };
}

export function parentIsA(nodeName) {
  return function (node) {
    return parent(node).localeName === nodeName;
  };
}

export function emptyTextContent(node) {
  return onlyWhitespace(node.textContent);
}

/**
 * Factory for a node action which is performed when predicate returns true.
 */
export function test(predicate, action) {
  return function (node) {
    if (predicate(node)) {
      action(node);
    }
  };
}
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
export function getStyleSheet(id) {
  for (var i = 0; i < document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.id == id) {
      return sheet;
    }
  }
}

/**
 * Test to see if a string is only whitespace
 * TODO: Does it? I hate regex....
 */
function onlyWhitespace(str) {
  return !/\S/.test(str);
}

/**
 * Curried function for adding a classname to a node's parentNode
 */
export function addClass(className) {
  return function (node) {
    return node.parentNode.classList.add(className);
  };
}

/**
 * Curried function for removing a classname to a node's parentNode
 */
export function removeClass(className) {
  return function (node) {
    return node.parentNode.classList.remove(className);
  };
}

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
      result = criterion.fn(node);
    } catch (e) {
      console.error(`${criterion.name} threw: ${e}`);
      return criterion.throwReturn || true;
    }
    return result;
  };
}

/**
 * Use with Array.filter and other things to get only truthy values
 * just an alias for id
 */
export const truthy = id;

function all(collection, predicate) {
  return collection.reduce((acc, el) => {
    return acc && predicate(el);
  });
}

function id(value) {
  return value;
}

function meets(node, criteria) {
  const results = criteria.map((predicate) => predicate(node));

  return all(results, truthy);
}

function hasChildren(node) {
  return node.childNodes[0] !== undefined;
}

function parent(node) {
  return node.parentNode;
}
