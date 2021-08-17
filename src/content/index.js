import {
  addClass,
  collectNodes,
  doAll,
  emptyTextContent,
  getStyleSheet,
  log,
  not,
  parentAttrIs,
  parentIsA,
  removeClass,
  safeWrap,
  test,
  truthy,
} from './helpers';

// BEGIN primary business logic
const CLASS_KEYS = ['badClassName', 'goodClassName'];
const STORAGE_KEYS = [
  ...CLASS_KEYS,
  'urlHostname',
  'testPattern',
  'goodClassContent',
  'badClassContent',
  'extraClassContent',
  'showDebugLog',
];

const STYLE_TITLE = 'TextHelpStyles';
const StyleSheet =
  getStyleSheet(STYLE_TITLE) || document.createElement('style');
StyleSheet.title = STYLE_TITLE;
document.body.appendChild(StyleSheet);

// initialize the cache with null values
// Cache is just in case I can't always
// get keys in the update methods.
// I don't know if that's a valid concern
const Cache = STORAGE_KEYS.reduce(
  (acc, key) => {
    acc[key] = null;
    return acc;
  },
  {
    styleSheet: StyleSheet,
  }
);

// `throwReturn` alters the value returned if the check throws an error
const criteria = [
  { name: 'Text Node', fn: isText },
  { name: 'Not aria-hidden', fn: not(parentAttrIs('aria-hidden', 'true')) },
  { name: 'Not <script>', fn: not(parentIsA('script')) },
  { name: 'Not <style>', fn: not(parentIsA('style')) },
  { name: 'Not empty', fn: not(emptyTextContent) },
].map(safeWrap);

const textNodes = collectNodes(document, criteria);

function allNodesDo(fn) {
  textNodes.forEach((node) => {
    fn(node);
  });
}

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

function initialize(storageState) {
  STORAGE_KEYS.forEach((key) => {
    Cache[key] = storageState[key];
  });

  log('Cache initialized:', Cache);

  log('Hostname Match? ', Cache.urlHostname !== window.location.hostname);
  // TODO: lift this into something a little better
  if (Cache.urlHostname !== window.location.hostname) return;

  log('updating classes');
  allNodesDo(test(matchesCachePattern, addClass(Cache.goodClassName)));
  allNodesDo(test(not(matchesCachePattern), addClass(Cache.badClassName)));
  log('classes updated');

  log('inserting rules');
  Cache.styleSheet.sheet.insertRule(storageState.extraClassContent, 0);
  Cache.styleSheet.sheet.insertRule(storageState.goodClassContent, 1);
  Cache.styleSheet.sheet.insertRule(storageState.badClassContent, 2);
  log('rules inserted');
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
// END primary business logic

// BEGIN main program loop
log('starting main program loop');
browser.storage.sync.get(STORAGE_KEYS).then(initialize).catch(console.error);
// TODO: doAll will need a way to cancel out, or something. Maybe with a predicate?
browser.storage.onChanged.addListener(
  doAll([updateCache, updateStyleSheet, updateClasses])
);
// END main program loop
