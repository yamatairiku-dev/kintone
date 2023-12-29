
(() => {
  'use strict';

  kintone.events.on('app.record.detail.show', event => {
    const myHeaderMenuSpace = kintone.app.record.getHeaderMenuSpaceElement();
    const startButton = document.createElement('button');
    startButton.id = 'janken_start_button';
    startButton.innerText = 'ジャンケンキングに挑戦！！';
    startButton.className = 'btn btn-info';
    myHeaderMenuSpace.innerText = '';

    const jankenItems = ['グー', 'チョキ', 'パー'];
    // ジャンケンキングに挑戦！！ボタンクリック
    startButton.onclick = () => {
      // ジャンケンスペース
      const jankenSpace = kintone.app.record.getSpaceElement('my_space_field');
      jankenSpace.innerText = '最初はグー！！\nジャンケン・・・\n';
      jankenSpace.style.width = '400px';
      jankenSpace.parentNode.style.width = '400px';

      const buttonColor = ['btn btn-primary', 'btn btn-danger', 'btn btn-warning'];
      for (let i = 0; i < jankenItems.length; i++) {
        const tmpButton = document.createElement('button');
        tmpButton.id = 'j_button' + i;
        tmpButton.className = buttonColor[i];
        tmpButton.innerText = jankenItems[i] + '！！';
        tmpButton.onclick = e => {
          const you = e.target.id.replace('j_button', '');
          const com = (you + 2) % jankenItems.length;
          jankenSpace.innerText = 'あなた：' + jankenItems[you] + '\nジャンケンキング:' + jankenItems[com] + '\nもう一度やりますか？';
        };
        jankenSpace.appendChild(tmpButton);
      }
    };
    myHeaderMenuSpace.appendChild(startButton);
    return event;
  });
})();
