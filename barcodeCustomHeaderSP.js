// PC:一覧画面表示
const menuDiv = 'menu-div';
kintone.events.on(['mobile.app.record.index.show'], (event) => {
  // 増殖バグを防ぐ
  if (document.getElementById(menuDiv) !== null) {
    return;
  }

  // wrapper
  const div = document.createElement('div');
  div.id = menuDiv;
  div.style = 'display:flex; align-items: center;';

  const header = kintone.mobile.app.getHeaderSpaceElement();
  header.style.width = '540px';

  // クエリ文字列抽出
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const searchParams = new URLSearchParams(window.location.search);
  const queryStr = searchParams.get('query');
  let textValue = '';
  if (queryStr) {
    textValue = queryStr.split('"')[1];
  }

  // eslint-disable-next-line no-undef
  const Kuc = Kucs['1.15.0'];

  const input = new Kuc.MobileText({
    placeholder: 'タイトルを検索',
    value: textValue,
    // className: 'ui-component-margin',
  });
  const searchButton = new Kuc.MobileButton({
    type: 'submit',
    text: '検索',
    className: 'ui-component-index-margin',
  });
  const clearButton = new Kuc.MobileButton({
    type: 'normal',
    text: 'クリア',
    className: 'ui-component-index-margin',
  });

  div.appendChild(input);
  div.appendChild(searchButton);
  div.appendChild(clearButton);
  header.appendChild(div);

  // input.addEventListener('keydown', (e) => {
  //   if (e.shiftKey) {
  //     if (e.key === 'Enter') {
  //       e.preventDefault();
  //       searchKeyWord();
  //     }
  //   }
  // });
  input.focus();

  searchButton.onclick = searchKeyWord;

  clearButton.onclick = () => {
    const viewId = searchParams.get('view');
    let str_query = '';
    if (viewId) {
      str_query += '?view=' + viewId;
    }
    document.location = location.origin + location.pathname + str_query;
  };

  function searchKeyWord() {
    const searchWord = input.value;
    if (searchWord === '') {
      return;
    }
    const keyword = htmlEscape(searchWord);
    let str_query = preareQueryString(keyword);
    const viewId = searchParams.get('view');
    if (viewId) {
      str_query += '&view=' + viewId;
    }
    if (str_query) {
      document.location = location.origin + location.pathname + encodeURI(str_query);
    }
  }

  // 検索フィールド
  const FIELD_CODE = 'title_input';

  // HTMLエスケープ処理
  const htmlEscape = (str) => {
    if (str) {
      return str.replace(/[&<>"'`]/g, (match) => {
        const escape = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          // eslint-disable-next-line quotes
          "'": '&#39;',
          '`': '&#x60;',
        };
        return escape[match];
      });
    }
    return str;
  };

  // クエリ文字列生成
  const preareQueryString = (str) => {
    if (str !== '' && str) {
      return '?query=' + FIELD_CODE + ' like "' + str + '"';
    }
    return str;
  };
});
