function log() {
  console.log(...arguments);
}
function domNode(id) {
  return document.getElementById(id);
}

// Ostensibly this is helping simplify the addition of new fields
// by declaring the data that should flow into and out of the storage api
const INPUTS = [
  {
    getStorageItems: () => {
      const id = 'good-class';
      const node = domNode(id);

      return [
        storageItem('goodClassContent', node.value, '', id),
        storageItem('goodClassName', classNameFor(node), '', id),
      ];
    },
  },
  {
    getStorageItems: () => {
      const id = 'bad-class';
      const node = domNode(id);

      return [
        storageItem('badClassContent', node.value, '', id),
        storageItem('badClassName', classNameFor(node), '', id),
      ];
    },
  },
  {
    getStorageItems: () => {
      const id = 'extra-class';
      const node = domNode(id);

      return [storageItem('extraClassContent', node.value, '', id)];
    },
  },
  {
    getStorageItems: () => {
      const id = 'show-debug-log';
      const node = domNode(id);

      return [storageItem('showDebugLog', node.checked, false, id)];
    },
  },
  {
    getStorageItems: () => {
      const id = 'url-hostname';
      const node = domNode(id);

      return [storageItem('urlHostname', node.value, 'localhost', id)];
    },
  },
  {
    getStorageItems: () => {
      const id = 'good-test-pattern';
      const node = domNode(id);

      return [storageItem('testPattern', node.value, 'QA: ', id)];
    },
  },
];

function storageItem(storageName, value, defaultValue, domId) {
  return { storageName, value, defaultValue, domId };
}

function transform(inputObject) {
  return inputObject.getStorageItems();
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
