function log() {
  console.log(...arguments);
}

const INPUTS = [
  {
    id: 'good-class',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [
        storageItem('goodClassContent', domNode.value, '', id),
        storageItem('goodClassName', classNameFor(domNode), '', id),
      ];
    },
  },
  {
    id: 'bad-class',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [
        storageItem('badClassContent', domNode.value, '', id),
        storageItem('badClassName', classNameFor(domNode), '', id),
      ];
    },
  },
  {
    id: 'extra-class',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [storageItem('extraClassContent', domNode.value, '', id)];
    },
  },
  {
    id: 'show-debug-log',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [storageItem('showDebugLog', domNode.checked, false, id)];
    },
  },
  {
    id: 'url-hostname',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [storageItem('urlHostname', domNode.value, 'localhost', id)];
    },
  },
  {
    id: 'good-test-pattern',
    storageItemsTransform: (id) => {
      const domNode = document.getElementById(id);

      return [storageItem('testPattern', domNode.value, 'QA: ', id)];
    },
  },
];

function storageItem(storageName, value, defaultValue, domId) {
  return { storageName, value, defaultValue, domId };
}

function transform(inputObject) {
  return inputObject.storageItemsTransform(inputObject.id);
}

const RE = /[^a-z0-9-]/gi;

function classNameFor(classNode) {
  const firstLine = classNode.value.split('\n')[0];
  return firstLine.replace(RE, '');
}

function storageMap() {
  return INPUTS.map(transform).reduce((acc, items) => {
    items.forEach((item) => {
      acc[item.storageName] = item.value;
    });
    return acc;
  }, {});
}

function storedValues() {
  return INPUTS.map(transform).reduce((acc, items) => {
    acc.push(items[0]);
    return acc;
  }, []);
}

function saveOptions(e) {
  e.preventDefault();

  log('saving values');
  const map = storageMap();
  log('values to save: ', map);
  browser.storage.sync.set(map);
}

const setCurrentChoice = (item) => (result) => {
  log('set current choice: ', item, result);
  document.getElementById(item.domId).value =
    result[item.storageName] || item.defaultValue;
};

function getAndSet(item) {
  log('get and set: ', item);
  browser.storage.sync
    .get(item.storageName)
    .then(setCurrentChoice(item), console.log);
}

function restoreOptions() {
  log('restoring options');
  storedValues().forEach(getAndSet);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
