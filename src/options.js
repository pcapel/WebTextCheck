function GoodClassInput() {
  return document.querySelector('#good-class');
}

function BadClassInput() {
  return document.querySelector('#bad-class');
}

function ExtraClassInput() {
  return document.querySelector('#extra-class');
}

function TestPatternInput() {
  return document.querySelector('#good-test-pattern');
}

function HostnameInput() {
  return document.querySelector('#url-hostname');
}

const RE = /[^a-z0-9-]/gi;

function classNameFor(classNode) {
  const firstLine = classNode.value.split('\n')[0];
  return firstLine.replace(RE, '');
}

const STORAGE = {
  badClassName: 'badClassName',
  goodClassName: 'goodClassName',
  badClassContent: 'badClassContent',
  goodClassContent: 'goodClassContent',
  extraClassContent: 'extraClassContent',
  testPattern: 'testPattern',
  urlHostname: 'urlHostname',
};

function saveOptions(e) {
  e.preventDefault();

  const badClassName = classNameFor(BadClassInput());
  const goodClassName = classNameFor(GoodClassInput());
  const badClassContent = BadClassInput().value;
  const goodClassContent = GoodClassInput().value;
  const extraClassContent = ExtraClassInput().value;
  const testPattern = TestPatternInput().value;
  const urlHostname = HostnameInput().value;

  browser.storage.sync.set({
    badClassName,
    goodClassName,
    badClassContent,
    goodClassContent,
    extraClassContent,
    testPattern,
    urlHostname,
  });
}

const setCurrentChoice = (key) => (result) => {
  switch (key) {
    case STORAGE.badClassContent:
      BadClassInput().value = result.badClassContent || '';
      break;
    case STORAGE.goodClassContent:
      GoodClassInput().value = result.goodClassContent || '';
      break;
    case STORAGE.extraClassContent:
      ExtraClassInput().value = result.extraClassContent || '';
      break;
    case STORAGE.testPattern:
      TestPatternInput().value = result.testPattern || 'QA: ';
      break;
    case STORAGE.urlHostname:
      HostnameInput().value = result.urlHostname || '';
      break;
    case STORAGE.styleContent:
      break;
  }
};

function getAndSet(storageKey) {
  browser.storage.sync
    .get(storageKey)
    .then(setCurrentChoice(storageKey), console.log);
}

function restoreOptions() {
  Object.values(STORAGE).forEach(getAndSet);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
