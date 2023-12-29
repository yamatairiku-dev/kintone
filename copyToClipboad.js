(() => {
  'use strict';
  // コピー対象フィールド名とコピーボタン配置フィールド名のペアをボタンの個数分設定（下記例はボタンが3個）
  const copyButtonElements = [
    {targetFieldName: 'コピー対象', btnFieldName: 'copy_button'},
    {targetFieldName: 'コピー対象2', btnFieldName: 'copy_button2'},
    {targetFieldName: 'コピー対象3', btnFieldName: 'copy_button3'},
  ];

  const btnNums = copyButtonElements.length;
  const copyButtonText = 'クリップボードへコピー';
  const copiedButtonText = 'Copied!';

  // 対象イベント：新規、詳細、編集画面表示
  const showEvents = ['app.record.create.show', 'app.record.detail.show', 'app.record.edit.show'];

  // 対象イベント：新規、編集画面でコピー対象フィールドの値の変更 + showEvents
  const changeShowEvents = [];
  for (let i = 0; i < btnNums; i++) {
    const element = copyButtonElements[i];
    changeShowEvents.push(`app.record.create.change.${element.targetFieldName}`);
    changeShowEvents.push(`app.record.edit.change.${element.targetFieldName}`);
  }
  changeShowEvents.push(showEvents);

  // コピーボタンを作成
  function createCopyButton(event) {
    for (let i = 0; i < btnNums; i++) {
      const element = copyButtonElements[i];
      const copyButton = document.createElement('button');
      copyButton.id = element.btnFieldName;
      copyButton.innerText = copyButtonText;
      copyButton.className = 'kintoneplugin-button-normal';
      kintone.app.record.getSpaceElement(element.btnFieldName).appendChild(copyButton);
    }
  }

  // コピーボタンにクリックイベントを登録
  function attachOnClickEvent(event) {
    const record = event.record;
    for (let i = 0; i < btnNums; i++) {
      const element = copyButtonElements[i];
      const button = document.getElementById(element.btnFieldName);
      button.onclick = async () => {
        const targetText = record[element.targetFieldName].value;
        try {
          await navigator.clipboard.writeText(targetText);
          button.innerText = copiedButtonText;
          setTimeout(() => {
            button.innerText = copyButtonText;
          }, 1000);
        } catch (error) {
          alert((error && error.message) || 'コピーに失敗しました');
        }
      };
    }
  }

  kintone.events.on(showEvents, createCopyButton);
  kintone.events.on(changeShowEvents, attachOnClickEvent);

})();
