(() => {
  'use strict';
  kintone.events.on(['app.record.index.show'], (event) => {
    if (event.viewId !== 6381393) {
      return;
    }
    const records = event.records;
    const myCustomizedView = document.getElementById('my-customized-view');
    if (records.length === 0) {
      myCustomizedView.innerText = '表示するレコードがありません';
      return;
    }

    // const recUrl = location.protocol + '//' + location.hostname + '/k/' + kintone.app.getId() + '/show#record=';
    const recUrl = location.origin + location.pathname + 'show?record=';
    myCustomizedView.innerText = '';

    const title = 'title_input';
    const authors = 'authors_input';
    const publishedDate = 'published_date_input';
    const thumbnailUrl = 'thumbnail_url_input';
    const infoLink = 'info_link_input';
    const description = 'description_input';
    const publisher = 'publisher_input';
    const rentalUserTable = 'rental_user_table';
    const rentalUser = 'rental_user';
    const rentalDate = 'rental_date';

    const recordData = [];
    for (let i = 0; i < records.length; i++) {
      recordData[i] = {
        title: [records[i][title].value, records[i][infoLink].value],
        authors: records[i][authors].value,
        publishedDate: records[i][publishedDate].value,
        description: records[i][description].value,
        publisher: records[i][publisher].value,
        thumbnailUrl: [records[i][thumbnailUrl].value, records[i]['レコード番号'].value],
        rentalUser: records[i][rentalUserTable].value,
      };
    }
    const renderThumbnail = (data) => {
      const img = document.createElement('img');
      const aTag = document.createElement('a');
      img.src = data[0];
      img.width = '50';
      aTag.href = recUrl + data[1];
      aTag.appendChild(img);
      return aTag;
    };

    const renderTitle = (data) => {
      const aTag = document.createElement('a');
      aTag.href = data[1];
      aTag.innerText = data[0];
      aTag.target = '_blank';
      return aTag;
    };

    const renderDiscription = (data) => {
      const span = document.createElement('span');
      const MAX_LENGTH = '55';
      const dataLength = data.length;
      if (dataLength > MAX_LENGTH) {
        span.innerText = data.substr(0, MAX_LENGTH) + '...';
      } else {
        span.innerText = data;
      }
      return span;
    };

    // フィールドをユーザー選択にした場合
    const renderRentalUser = (data) => {
      const div = document.createElement('span');
      for (let i = 0; i < data.length; i++) {
        let dateText = data[i].value[rentalDate].value;
        if (!dateText) {
          dateText = '';
        } else {
          dateText = '@' + dateText;
        }
        // userArrがない場合の考慮不要
        const userArr = data[i].value[rentalUser].value;
        let userText = '';
        for (let index = 0; index < userArr.length; index++) {
          if (index > 0) {
            userText += ',';
          }
          userText += userArr[index].name;
        }
        const span = document.createElement('span');
        span.style = 'display: inline-block';
        span.innerText = userText + dateText;
        div.appendChild(span);
      }
      return div;
    };

    // eslint-disable-next-line no-undef
    const table = new Kuc.Table({
      actionButton: false,
      className: 'ui-component-table-header',
      columns: [
        {
          title: '',
          field: 'thumbnailUrl',
          render: renderThumbnail,
        },
        {
          title: 'タイトル',
          field: 'title',
          render: renderTitle,
        },
        {
          title: '著者',
          field: 'authors',
          visible: true, // moileは非表示
        },
        {
          title: '出版社',
          field: 'publisher',
        },
        {
          title: '出版日',
          field: 'publishedDate',
          visible: true, // moileは非表示
        },
        {
          title: '説明',
          field: 'description',
          render: renderDiscription,
          visible: true, // moileは非表示
        },
        {
          title: '借りてる人',
          field: 'rentalUser',
          render: renderRentalUser,
        },
      ],
      data: recordData,
    });

    const div = document.createElement('div');
    div.className = 'ui-component-index-table-wrapper';
    div.appendChild(table);
    myCustomizedView.appendChild(div);
  });
})();
