// 簡易的な用途で利用すること
// 変換したい文字列が改行されていると、うまく変換できない
// https://cybozu.dev/ja/kintone/docs/js-api/#event
// プラグインは登録していない

'use strict';
const fs = require('fs');
const readline = require('readline');

const inFile = ['./barcodeMain.js', './barcodeCustomHeader.js', 'barcodeCustomView.js'];
const outFile = ['./barcodeMainSP.js', './barcodeCustomHeaderSP.js', 'barcodeCustomViewSP.js'];
const convertStrings = [
  ['app.record.index.show', 'mobile.app.record.index.show'],
  ['app.record.detail.show', 'mobile.app.record.detail.show'],
  ['app.record.detail.delete.submit', 'mobile.app.record.detail.delete.submit'],
  ['app.record.detail.process.proceed', 'mobile.app.record.detail.process.proceed'],
  ['app.record.create.show', 'mobile.app.record.create.show'],
  ['app.record.create.change', 'mobile.app.record.create.change'],
  ['app.record.create.submit', 'mobile.app.record.create.submit'],
  ['app.record.create.submit.success', 'mobile.app.record.create.submit.success'],
  ['app.record.edit.show', 'mobile.app.record.edit.show'],
  ['app.record.edit.change', 'mobile.app.record.edit.change'],
  ['app.record.edit.submit', 'mobile.app.record.edit.submit'],
  ['app.record.edit.submit.success', 'mobile.app.record.edit.submit.success'],
  ['app.report.show', 'mobile.app.report.show'],
  ['portal.show', 'mobile.portal.show'],
  ['space.portal.show', 'mobile.space.portal.show'],
  ['kintone.app.record.getId', 'kintone.mobile.app.record.getId'],
  ['kintone.app.record.get', 'kintone.mobile.app.record.get'],
  ['kintone.app.record.set', 'kintone.mobile.app.record.set'],
  ['kintone.app.getId', 'kintone.mobile.app.getId'],
  ['kintone.app.getLookupTargetAppId', 'kintone.mobile.app.getLookupTargetAppId'],
  ['kintone.app.getRelatedRecordsTargetAppId', 'kintone.mobile.app.getRelatedRecordsTargetAppId'],
  ['kintone.app.getQueryCondition', 'kintone.mobile.app.getQueryCondition'],
  ['kintone.app.getQuery', 'kintone.mobile.app.getQuery'],
  ['kintone.app.record.setFieldShow', 'kintone.mobile.app.record.setFieldShow'],
  ['kintone.app.record.setGroupFieldOpen', 'kintone.mobile.app.record.setGroupFieldOpen'],
  ['kintone.app.record.getFieldElement', 'kintone.mobile.app.record.getFieldElement'],
  ['kintone.app.getHeaderMenuSpaceElement', 'kintone.mobile.app.getHeaderSpaceElement'],
  ['kintone.app.record.getSpaceElement', 'kintone.mobile.app.record.getSpaceElement'],
  ['kintone.portal.getContentSpaceElement', 'kintone.mobile.portal.getContentSpaceElement'],
  ['kintone.space.portal.getContentSpaceElement', 'kintone.mobile.space.portal.getContentSpaceElement'],
  ['Kuc.Button', 'Kuc.MobileButton'],
  ['Kuc.Text', 'Kuc.MobileText'],
  ['visible: true, // moileは非表示', 'visible: false, // moileは非表示'],
];

for (let index = 0; index < inFile.length; index++) {
  // 処理
  // readstreamを作成
  const rs = fs.createReadStream(inFile[index]);
  // writestreamを作成
  const ws = fs.createWriteStream(outFile[index]);

  // インターフェースの設定
  const rl = readline.createInterface({
    // 読み込みたいストリームの設定
    input: rs,
    // 書き出したいストリームの設定
    output: ws,
  });

  // カウンター
  let cnt = 0;

  // 1行ずつ読み込む設定
  rl.on('line', (lineString) => {
    let str = lineString;
    for (let i = 0; i < convertStrings.length; i++) {
      if (str.match(convertStrings[i][0])) {
        str = str.replace(convertStrings[i][0], convertStrings[i][1]);
      }
    }

    // wsに一行ずつ書き込む
    ws.write(str + '\n');
    cnt++;
  });
  rl.on('close', () => {
    console.log('END!', ' 処理行数：' + cnt);
  });
}
