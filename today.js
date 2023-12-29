(() => {
  'use strict';

  const targetEvent = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.index.edit.show',
    'app.record.index.show',
    'app.record.detail.show'
  ];

  kintone.events.on(targetEvent, event => {
    const record = event.record;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    record['今日'].value = `${year}-${month}-${day}`;
    record['今日'].disabled = true;
    return event;
  });

})();
