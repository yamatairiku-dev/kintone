(() => {
  'use strict';

  function autoNum(event) {
    const record = event.record;

    // 日付を取得し、2桁の年を取得する
    const nendo = record['年度'].value;

    // クエリ文の設定
    const query = {
      'app': kintone.app.getId(),
      'query': `年度 in ("${nendo}") order by 自動採番 desc limit 1`
    };

    // 設定された日付から最新の番号を取得する
    return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', query).then(resp => {
      const records = resp.records;

      // 対象レコードがあった場合
      if (records.length > 0) {
        const rec = records[0];
        let autono = rec['自動採番'].value;
        autono = parseInt(autono, 10) + 1;
        event.record['自動採番'].value = autono;

        // 対象レコードがなかった場合
      } else {
        event.record['自動採番'].value = 1;
      }
      return event;
    }).catch(e => {
      alert(`レコードの取得でエラーが発生しました  - error: ${e.message}`);
      return false;
    });
  }
  // 新規作成画面の保存
  kintone.events.on('app.record.create.submit', autoNum);

  // 新規作成画面表示
  kintone.events.on('app.record.create.show', event => {
    const record = event.record;
    // フィールドを非活性にする
    record['自動採番'].disabled = true;
    return event;
  });

  // 編集画面表示
  kintone.events.on(['app.record.edit.show', 'app.record.index.edit.show'], event => {
    const record = event.record;
    // フィールドを非活性にする
    record['自動採番'].disabled = true;
    record['年度'].disabled = true;
    return event;
  });

})();
