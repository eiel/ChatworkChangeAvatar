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
  img.setAttribute('width', 24);
  img.setAttribute('height', 24);
  img.setAttribute('src', url);
  img.setAttribute('style', "margin-left: 1px");
  img.addEventListener('click', () => getImage(url).then(changeAvatar));
  div.appendChild(img);
  return div;
}

function getImage(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "blob";

  let promise = new Promise((resolve) => {
    req.addEventListener('load', () => resolve(req.response));
  });
  req.send();
  return promise;
}

function changeAvatar(blob) {
  let request = new XMLHttpRequest();
  request.open("POST", createRequestURL(getParams()));

  request.addEventListener('load', (e) => {
    console.log(e);
  });
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
  document.body.appendChild(script);
}

function getParams() {
  const div = document.querySelector('#' + value_id);
  const string = div.dataset['value'];
  return JSON.parse(string);
}

function createRequestURL({ACCESS_TOKEN, MYID, CLIENT_VER}) {
  return `/gateway.php?cmd=edit_profile_avatar_image&_f=1&myid=${MYID}&_v=${CLIENT_VER}&_t=${ACCESS_TOKEN}`
}

function setup() {
  insertParams();
  let urls = [
    'https://user-images.githubusercontent.com/92595/28902621-24cc177e-783b-11e7-918a-e50bfb65e57b.png',
    'https://avatars3.githubusercontent.com/u/92595?v=4&s=460',
  ];
  insertAvatarButtons(urls);
}

export default () => ready().then(setup);
