function all(collection, predicate) {
  return collection.reduce((acc, el) => {
    return acc && predicate(el);
  });
}

export function getStyleSheet(title) {
  for (var i = 0; i < document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i];
    if (sheet.title == title) {
      return sheet;
    }
  }
}

const id = (value) => value;
export const truthy = id;

function meets(node, criteria) {
  const results = criteria.map((predicate) => predicate(node));

  return all(results, truthy);
}

function hasChildren(node) {
  return node.childNodes[0] !== undefined;
}

export function onlyWhitespace(str) {
  return !/\S/.test(str);
}

export const addClass = (className) => (node) => {
  return node.parentNode.classList.add(className);
};

export const removeClass = (className) => (node) => {
  return node.parentNode.classList.remove(className);
};

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

// Handles the issue with different nodeTypes having access to different APIs.
// For example, you may want to predicate node selection on some
// attributes, but getAttribute isn't defined on all nodes. So you need to be
// able to define sane behavior.
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
