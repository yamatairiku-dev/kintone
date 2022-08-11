(() => {
  'use strict';

  function createCpoyButton(event) {
    const copyButtonText = 'クリップボードへコピー';
    const copiedButtonText = 'コピー済み';
    const record = event.record;
    const copyButton = document.createElement('button');
    copyButton.id = 'copy_button';
    copyButton.innerText = copyButtonText;
    copyButton.className = 'kintoneplugin-button-normal';
    const targetText = record['コピー対象'].value;

    copyButton.onclick = async () => {
      try {
        await navigator.clipboard.writeText(targetText);
        copyButton.innerText = copiedButtonText;
        setTimeout(() => {
          copyButton.innerText = copyButtonText;
        }, 1000);
      } catch (error) {
        alert((error && error.message) || 'コピーに失敗しました');
      }
    };

    kintone.app.record.getSpaceElement('copy_button').appendChild(copyButton);

  }

  const events = ['app.record.detail.show', 'app.record.edit.show'];
  kintone.events.on(events, createCpoyButton);

})();
