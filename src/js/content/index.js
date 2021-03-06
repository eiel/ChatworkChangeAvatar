// @flow

// DOMContentLoaded時またはDOMContentLoadedが完了されている場合に引数でわたされた関数を実行する
function ready() {
  if (document.readyState === "complete"
    || document.readyState === "loaded"
    || document.readyState === "interactive") {
     // document has at least been parsed
     return Promise.resolve();
  } else {
     return new Promise((resolve) =>
       document.addEventListener("DOMContentLoaded", resolve)
     );
  }
}

function insertAvatarButtons(urls) {
  let navigation = document.querySelector('.globalHeader__navigation');
  if (navigation === null) {
    return
  }
  for (var i = 0; urls[i]; i++) {
    let url = urls[i];
    let element = avatarButton(url);
    navigation.prepend(element);
  }
}

function avatarButton(url) {
  let div = document.createElement('div');
  div.setAttribute('role', 'button');
  let img = document.createElement('img');
  img.setAttribute('width', '24');
  img.setAttribute('height', '24');
  img.setAttribute('src', url);
  img.setAttribute('style', "margin-left: 1px");
  img.addEventListener('click', () => getImage(url).then(changeAvatar));
  div.appendChild(img);
  return div;
}

function getImage(url): Promise<Blob> {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "blob";

  let promise = new Promise((resolve, reject) => {
    req.onload = () => {
      resolve(req.response);
    };
  });
  req.send();
  return promise;
}

function changeAvatar(blob: Blob) {
  let request = new XMLHttpRequest();
  let params = getParams();
  if (params === null) {
    // TODO: error get access_token
    return;
  }
  request.open("POST", createRequestURL(params));

  let formData = new FormData();
  formData.append("avatar_upload_file", blob);
  request.send(formData);
}

const value_id = 'chatwork-change-avatar-value' ;
// 必要になる値を取得できるようにDOMに値を埋め込む関数
function insertParams() {
  let script = document.createElement("script");
  const code = `
    (function() {
      var n = {\"ACCESS_TOKEN\": ACCESS_TOKEN, \"MYID\": MYID, \"CLIENT_VER\": CLIENT_VER};
      var div = document.createElement('div');
      div.setAttribute('id', '${value_id}');
      div.setAttribute('data-value', JSON.stringify(n));
      document.body.appendChild(div);
    })();
    `
  script.textContent = code;
  if (document.body === null) {
    return;
  }
  document.body.appendChild(script);
}

function getParams(): {ACCESS_TOKEN: string, MYID: string, CLIENT_VER: string} | null {
  const div = document.querySelector('#' + value_id);
  if (div === null) { return null; }
  const string = div.dataset['value'];
  if (string == null) { return null; }
  return JSON.parse(string);
}

function createRequestURL({ACCESS_TOKEN, MYID, CLIENT_VER}) {
  return `/gateway.php?cmd=edit_profile_avatar_image&_f=1&myid=${MYID}&_v=${CLIENT_VER}&_t=${ACCESS_TOKEN}`
}

declare type Items = {url_list: Array<string>};
declare class ChromeStorage {
  sync: ChromeStorageSync;
}
declare type Hoge<T> = (items: T) => mixed
declare class ChromeStorageSync {
  get<T>(defaults: T, callback: Hoge<T>): mixed;
}
declare class Chrome {
  storage: ChromeStorage;
}

declare var chrome: Chrome;

function getUrlList(): Promise<Array<string>> {
  const defaults: Items = {url_list: []};

  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (items: Items) => {
      resolve(items.url_list);
    });
  });
}

function setup() {
  insertParams();
  getUrlList()
    .then(insertAvatarButtons);
}

export default () => ready().then(setup);
