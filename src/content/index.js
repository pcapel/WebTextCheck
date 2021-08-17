import {
  safeWrap,
  collectNodes,
  onlyWhitespace,
  addClass,
  removeClass,
  truthy,
  getStyleSheet,
} from './helpers';

const CLASS_KEYS = ['badClassName', 'goodClassName'];
const STORAGE_KEYS = [
  ...CLASS_KEYS,
  'urlHostname',
  'testPattern',
  'goodClassContent',
  'badClassContent',
  'extraClassContent',
];

const STYLE_TITLE = 'TextHelpStyles';
const StyleSheet =
  getStyleSheet(STYLE_TITLE) || document.createElement('style');
StyleSheet.title = STYLE_TITLE;
document.body.appendChild(StyleSheet);

// initialize the cache with null values
const Cache = STORAGE_KEYS.reduce(
  (acc, key) => {
    acc[key] = null;
    return acc;
  },
  {
    styleSheet: StyleSheet,
  }
);

// Can define `throwReturn` to alter the value returned if the check throws an
// error
const criteria = [
  {
    name: 'Is Text Node',
    call: (node) => node.nodeType === 3,
  },
  {
    name: 'Is Not Aria Hidden',
    call: (node) => node.parentNode.getAttribute('aria-hidden') !== 'true',
  },
  {
    name: 'Is not a script',
    call: (node) => node.parentNode.localName !== 'script',
  },
  {
    name: 'Is not a style',
    call: (node) => node.parentNode.localName !== 'style',
  },
  {
    name: 'Is not whitespace only',
    call: (node) => !onlyWhitespace(node.textContent),
  },
].map(safeWrap);

const textNodes = collectNodes(document, criteria);

function allNodesDo(fn) {
  textNodes.forEach((node) => {
    fn(node);
  });
}

const test = (predicate, action) => (node) => {
  if (predicate(node)) {
    action(node);
  }
};

function matchesCachePattern(node) {
  let regex;
  try {
    regex = new RegExp(Cache.testPattern, 'i');
  } catch (e) {
    console.error(e);
    return false;
  }
  return regex.test(node.textContent);
}

function not(fn) {
  return function () {
    return !fn(...arguments);
  };
}

function initialize(storageState) {
  STORAGE_KEYS.forEach((key) => {
    Cache[key] = storageState[key];
  });

  // TODO: lift this into something a little better
  if (Cache.urlHostname !== window.location.hostname) return;

  allNodesDo(test(matchesCachePattern, addClass(Cache.goodClassName)));
  allNodesDo(test(not(matchesCachePattern), addClass(Cache.badClassName)));

  Cache.styleSheet.sheet.insertRule(storageState.extraClassContent, 0);
  Cache.styleSheet.sheet.insertRule(storageState.goodClassContent, 1);
  Cache.styleSheet.sheet.insertRule(storageState.badClassContent, 2);
}

browser.storage.sync.get(STORAGE_KEYS).then(initialize).catch(console.error);

function doAll(fns, predicate = () => true) {
  return function () {
    if (predicate(...arguments)) fns.forEach((fn) => fn(...arguments));
  };
}

function updateCache(changes) {
  const keys = Object.keys(Cache);
  keys.forEach((key) => {
    if (changes[key] !== undefined) {
      Cache[key] = changes[key].newValue;
    }
  });
}

function updateClasses(changes) {
  CLASS_KEYS.forEach((key) => {
    if (changes[key]) {
      allNodesDo(removeClass(changes[key].oldValue));
    }
  });
  allNodesDo(test(matchesCachePattern, addClass(Cache.goodClassName)));
  allNodesDo(test(not(matchesCachePattern), addClass(Cache.badClassName)));
}

function updateStyleSheet(changes) {
  // always delete higher number rules first, for reasons.
  Cache.styleSheet.sheet.deleteRule(2);
  Cache.styleSheet.sheet.deleteRule(1);
  Cache.styleSheet.sheet.deleteRule(0);

  Cache.styleSheet.sheet.insertRule(changes.extraClassContent.newValue, 0);
  Cache.styleSheet.sheet.insertRule(changes.goodClassContent.newValue, 1);
  Cache.styleSheet.sheet.insertRule(changes.badClassContent.newValue, 2);
}

// TODO: doAll will need a way to cancel out, or something. Maybe with a predicate?
browser.storage.onChanged.addListener(
  doAll([updateCache, updateStyleSheet, updateClasses])
);
