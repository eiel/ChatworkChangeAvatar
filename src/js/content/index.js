function ready(callback) {
  if (document.readyState === "complete"
    || document.readyState === "loaded"
    || document.readyState === "interactive") {
     // document has at least been parsed
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

function insertAvatarButton() {
  let urls = [
    'https://user-images.githubusercontent.com/92595/28860626-4f5100f2-7798-11e7-83a0-f3d6fd32a007.png',
    'https://user-images.githubusercontent.com/92595/28860628-511d6a42-7798-11e7-8dd2-131b4c8f6832.png',
    // 'https://avatars3.githubusercontent.com/u/92595?v=4&s=460'
  ]
  let navigation = document.querySelector('.globalHeader__navigation');

  for (var i = 0; urls[i]; i++) {
    let url = urls[i];
    let div = document.createElement('div');
    div.setAttribute('role', 'button');
    let img = document.createElement('img');
    img.setAttribute('width', 24);
    img.setAttribute('height', 24);
    img.setAttribute('src', url);
    img.setAttribute('style', "margin-left: 1px");
    img.addEventListener('click', () => changeAvatar(url));
    div.appendChild(img);
    navigation.prepend(div);
  }
}

function getImage(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "blob";

  req.onload = () => {
    callback(req.response);
  };
  req.send();
}

function changeAvatar(url) {
  getImage(url, (blob) => {
    let formData = new FormData();
    formData.append("avatar_upload_file", blob);

    let request = new XMLHttpRequest();
    request.open("POST", createRequestURL(getParams()));
    request.onload = (e) => {
      console.log(e);
    }
    request.send(formData);
  })
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

export default () => {
  ready(() => {
    insertParams();
    insertAvatarButton();
  });
}