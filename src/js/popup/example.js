function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate.toLocaleDateString(), '</li>');
    console.log(f);
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function getUrlList(): Promise<Array<string>> {
  const defaults: Items = {url_list: []};

  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (items: Items) => {
      resolve(items.url_list);
    });
  });
}

function createUrlList() {
  let self = {
    set(url_list) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({url_list: url_list}, resolve);
      })
    },
    add(url) {
      return self.get().then((url_list) => {
        url_list.push(url);
        return self.set(url_list);
      });
    },
    get() {
      return new Promise((resolve) => {
        chrome.storage.sync.get({url_list: []}, (items: Items) => {
          resolve(items.url_list);
        });
      });
    },
    remove(index: number) {
      return self.get().then((url_list) => {
        url_list.splice(index, 1);
        return self.set(url_list);
      });
    }
  }

  return self;
}

function setUrlList() {
  const defaults= {url_list: [
    'https://user-images.githubusercontent.com/92595/28902621-24cc177e-783b-11e7-918a-e50bfb65e57b.png',
    'https://avatars3.githubusercontent.com/u/92595?v=4&s=460',
  ]};
  chrome.storage.sync.set(defaults);
}

function render(url_list) {
  url_list.get().then((urls) => {
    let output = [];
    for (var i=0; urls[i]; i++) {
      const url = urls[i];
      output.push(`<table>
          <tr>
            <td><img src=${url} width="26" height="26"></td>
            <td>${url}</td>
            <td><form class="remove" name="delete[i]">
              <input type="submit" value="delete">
            </form></td>
          </tr>
        </table>
        `);
    }
    document.getElementById('list').innerHTML = output.join('');
    const buttons = document.querySelectorAll('.remove')
    for (var i=0; buttons[i]; i++) {
      let button = buttons[i];
      let n = i;
      button.addEventListener('submit', (e) => {
        e.preventDefault();
        url_list.remove(n).then(() => {
          location.reload();
        })
      });
    }
  });
}

export default () => {
  let url_list = createUrlList();
  document.forms.addUrl.addEventListener('submit', (e) => {
    e.preventDefault();
    url_list.add(document.forms.addUrl.url.value).then(() => {
      location.reload();
    });
  })
  render(url_list);
  // document.getElementById('files').addEventListener('change', handleFileSelect, false);
};
