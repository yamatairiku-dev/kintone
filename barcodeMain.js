(() => {
  'use strict';
  // アプリの部品の要素IDやフィールドコード
  const barcodeWrapper = 'barcode-wrapper';
  const barcodeButton = 'barcode-button';
  const isbnButton = 'isbn-button';
  const barcodeInput = 'barcode_input';
  const titleInput = 'title_input';
  const authorsInput = 'authors_input';
  const publishedDateInput = 'published_date_input';
  const thumbnailUrlInput = 'thumbnail_url_input';
  const thumbnailWrapper = 'thumbnail-wrapper';
  const descriptionInput = 'description_input';
  const infoLinkInput = 'info_link_input';
  const isbnApiUrl = 'https://www.googleapis.com/books/v1/volumes?q=isbn:';
  // eslint-disable-next-line no-undef
  // const Kuc = Kucs['1.15.0'];

  // PC:登録、編集画面表示後
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], (event) => {
    // パラメータ
    const barcodeView = 'barcode-view';
    const videoStream = 'video-stream';
    // ボタンの表示テキスト
    const barcodeButtonText = {
      init: 'カメラ準備中',
      ready: 'バーコード',
      scanning: '停止',
    };
    let isCameraInit = false; // カメラ初期化済み
    let isScan = false; // Scan中
    let scanedCode = ''; // スキャンしたコード
    const VALIDATION = 3; // 必要連続検証成功回数
    let validationCnt = 0; // 連続検証成功回数
    const INTERVAL = 100; // スキャンのインターバル(ミリ秒)
    let scanningCnt = -1; // スキャンされた回数 -1の時スキャンしない

    // videoのサイズ【カメラの画素数に合わせて入力】
    const videoSize = {
      w: 640,
      h: 480,
    };

    // 表示領域のサイズ【任意の値を入力】
    const viewSize = {
      w: 300,
      h: 200,
    };

    // 表示領域用のパラメータ
    const viewParam = {
      init: false,
      sx: 0,
      sy: 0,
      sw: 0,
      sh: 0,
      dx: 0,
      dy: 0,
      dw: 0,
      dh: 0,
    };

    // バーコードスキャン部分のサイズとガイドの太さ【任意の値を入力】
    const targetSize = {
      w: 200,
      h: 100,
      border: 2,
    };

    // バーコードスキャン部分のパラメータ
    const targetParam = {
      sx: 0,
      sy: 0,
      sw: 0,
      sh: 0,
      dx: 0,
      dy: 0,
      dw: 0,
      dh: 0,
    };

    // バーコードガイドのパラメータ
    const sqParam = {
      valid: false,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };

    // Quagga用のパラメータ
    const qConfig = {
      decoder: {
        readers: ['ean_reader', 'ean_8_reader'],
        multiple: false, // 同時に複数のバーコードを解析しない
      },
      src: '', // 後から指定
    };

    // 生の映像 ページには表示しない
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.id = videoStream;

    // バーコード表示領域
    const div = document.createElement('div');
    div.id = barcodeWrapper;
    div.className = 'ui-component-edit-margin';
    kintone.app.record.getSpaceElement(barcodeWrapper).appendChild(div);
    const canvas = document.createElement('canvas');
    canvas.id = barcodeView;
    div.appendChild(canvas);

    // バーコード起動停止ボタン
    // eslint-disable-next-line no-undef
    const cameraButton = new Kuc.Button({
      id: barcodeButton,
      text: barcodeButtonText.init,
      type: 'submit',
      className: 'ui-component-edit-margin',
    });
    kintone.app.record.getSpaceElement(barcodeButton).appendChild(cameraButton);

    // 本情報取得ボタン
    // eslint-disable-next-line no-undef
    const getBookDataButton = new Kuc.Button({
      id: isbnButton,
      text: '本の情報を取得',
      type: 'submit',
      className: 'ui-component-edit-margin',
    });
    kintone.app.record.getSpaceElement(isbnButton).appendChild(getBookDataButton);
    // サムネイル表示領域
    const img = document.createElement('img');
    const thumbnailUrl = event.record[thumbnailUrlInput].value;
    if (thumbnailUrl) {
      img.src = thumbnailUrl;
    }
    img.id = thumbnailWrapper;
    img.width = '128';
    img.className = 'ui-component-edit-margin';
    kintone.app.record.getSpaceElement(thumbnailWrapper).appendChild(img);

    // 線画領域
    const barView = canvas;
    // 線画領域のコンテキスト取得
    const barViewCtx = barView.getContext('2d');

    // 内部処理用のバーコード領域のコンテキスト取得
    const barcodeArea = document.createElement('canvas');
    const barcodeAreaCtx = barcodeArea.getContext('2d');

    cameraButton.onclick = () => {
      if (isScan === true) {
        scanEnd();
      } else {
        scanStart();
      }
    };
    function scanStart() {
      video.play();
      if (isCameraInit === true) {
        scanningCnt = 0;
        isScan = true;
        cameraButton.text = barcodeButtonText.scanning;
        kintone.app.record.set(event);
        setTimeout(scanning, 0);
      }
    }

    function scanEnd() {
      scanningCnt = -1;
      video.pause();
      isScan = false;
      cameraButton.text = barcodeButtonText.ready;
      kintone.app.record.set(event);
      validationCnt = 0;
      scanedCode = '';
    }

    function scanning() {
      // スキャン本体
      if (scanningCnt < 0) {
        return;
      }

      // パラメータ初期化()
      initParam();

      scanningCnt++;

      // バーコードエリアに線画
      barcodeAreaCtx.drawImage(
        video,
        targetParam.sx,
        targetParam.sy,
        targetParam.sw,
        targetParam.sh,
        targetParam.dx,
        targetParam.dy,
        targetParam.dw,
        targetParam.dh
      );

      // 線画からバーコード解析
      barcodeArea.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          qConfig.src = reader.result;
          // eslint-disable-next-line no-undef
          Quagga.decodeSingle(qConfig, () => {});
        };
        reader.readAsDataURL(blob);
      });

      // プレビューエリアに線画
      barViewCtx.drawImage(
        video,
        viewParam.sx,
        viewParam.sy,
        viewParam.sw,
        viewParam.sh,
        viewParam.dx,
        viewParam.dy,
        viewParam.dw,
        viewParam.dh
      );

      // バーコードガイドの線画
      if (sqParam.valid) {
        barViewCtx.beginPath();
        barViewCtx.strokeStyle = 'rgb(255,0,0)';
        barViewCtx.lineWidth = targetSize.border;
        barViewCtx.rect(sqParam.x, sqParam.y, sqParam.w, sqParam.h);
        barViewCtx.stroke();
      }

      // 再帰
      setTimeout(scanning, INTERVAL);
    }

    function initParam() {
      // すでに初期化されていた場合は処理しない
      if (viewParam.init) {
        return;
      }

      // 実際取得したサイズは要求したサイズと違う際は上書きされる。
      // videoが開始されていないと0になる
      videoSize.w = video.videoWidth;
      videoSize.h = video.videoHeight;

      // 線画領域のサイズセット
      // barView.style.width = viewSize.w;
      // barView.style.height = viewSize.h;

      // canvasは属性値でサイズを指定する必要がある
      barView.setAttribute('width', viewSize.w);
      barView.setAttribute('height', viewSize.h);

      // 表示領域の計算
      if (videoSize.w <= viewSize.w) {
        // 元のサイズの方が小さかったらそのまま
        viewParam.sx = 0;
        viewParam.sw = videoSize.w;

        viewParam.dx = 0;
        viewParam.dw = videoSize.w;
      } else {
        // 中央部を取得
        let wk = videoSize.w - viewSize.w;
        if (wk < 0) {
          alert('サイズ設定不備(view-X)');
          return;
        }
        wk /= 2; // 中央寄せするので÷2 (wk = wk / 2)

        viewParam.sx = wk;
        viewParam.sw = viewSize.w;

        viewParam.dx = 0;
        viewParam.dw = viewSize.w;
      }
      if (videoSize.h <= viewSize.h) {
        // 元のサイズの方が小さかったらそのまま
        viewParam.sy = 0;
        viewParam.sh = videoSize.h;

        viewParam.dy = 0;
        viewParam.dh = videoSize.h;
      } else {
        // 中央部を取得
        let wk = videoSize.h - viewSize.h;
        if (wk < 0) {
          alert('サイズ設定不備(view-Y)');
          return;
        }
        wk /= 2; // 中央寄せするので÷2

        viewParam.sy = wk;
        viewParam.sh = viewSize.h;

        viewParam.dy = 0;
        viewParam.dh = viewSize.h;
      }

      // バ ーコードスキャン部分の計算
      if (videoSize.w <= targetSize.w) {
        // 元のサイズの方が小さかったらそのまま
        targetParam.sx = 0;
        targetParam.sw = videoSize.w;

        targetParam.dx = 0;
        targetParam.dw = videoSize.w;
      } else {
        // 中央部を取得
        let wk = videoSize.w - targetSize.w;
        if (wk < 0) {
          alert('サイズ設定不備(target-X)');
          return;
        }
        wk /= 2; // 中央寄せするので÷2

        targetParam.sx = wk;
        targetParam.sw = targetSize.w;

        targetParam.dx = 0;
        targetParam.dw = targetSize.w;
      }
      if (videoSize.h <= targetSize.h) {
        // 元のサイズの方が小さかったらそのまま
        targetParam.sy = 0;
        targetParam.sh = videoSize.h;

        targetParam.dy = 0;
        targetParam.dh = videoSize.h;
      } else {
        // 中央部を取得
        let wk = videoSize.h - targetSize.h;
        if (wk < 0) {
          alert('サイズ設定不備(target-Y)');
          return;
        }
        wk /= 2; // 中央寄せするので÷2

        targetParam.sy = wk;
        targetParam.sh = targetSize.h;

        targetParam.dy = 0;
        targetParam.dh = targetSize.h;
      }

      // バーコードガイドの設定
      sqParam.valid = true;
      sqParam.w = targetSize.w;
      sqParam.h = targetSize.h;
      sqParam.x = (viewSize.w - targetSize.w) / 2;
      if (sqParam.x < 0) {
        sqParam.valid = false;
      }
      sqParam.y = (viewSize.h - targetSize.h) / 2;
      if (sqParam.y < 0) {
        sqParam.valid = false;
      }

      viewParam.init = true;
    }

    function initBarcodeScaner() {
      navigator.mediaDevices // カメラ使用の許可ダイアログが表示される
        .getUserMedia(
          // マイクはオフ, カメラの設定   背面カメラを希望する 640×480を希望する
          {
            audio: false,
            video: {
              facingMode: 'environment',
              width: { ideal: videoSize.w },
              height: { ideal: videoSize.h },
            },
          }
        )
        .then(
          // カメラと連携が取れた場合
          (stream) => {
            video.srcObject = stream;

            // Quaggaのスキャンイベント
            // eslint-disable-next-line no-undef
            Quagga.onDetected((result) => {
              // スキャンを止める
              if (scanningCnt < 0) {
                // 遅延してスキャンデータが来た場合は無視
                return;
              }

              if (scanedCode === result.codeResult.code && result.codeResult.code.length === 13) {
                validationCnt++;
                if (VALIDATION === validationCnt) {
                  scanEnd();
                  // コードをセット
                  event.record[barcodeInput].value = result.codeResult.code;
                  // APIを呼び出し
                  getVolumeInfo(isbnApiUrl + result.codeResult.code).then((volumeInfo) => {
                    if (volumeInfo !== '') {
                      setBookBataToField(volumeInfo, event);
                    } else {
                      alert('ISBNコードに対応する本の情報が見つかりませんでした ^^;');
                    }
                    kintone.app.record.set(event);
                  });
                }
              } else {
                scanedCode = result.codeResult.code;
                validationCnt = 0;
              }
            });
            isCameraInit = true;
            cameraButton.text = barcodeButtonText.ready;
            kintone.app.record.set(event);
          }
        )
        .catch(
          // エラー時
          (err) => alert(err.message)
        );
    }

    // エントリーポイント
    initBarcodeScaner();
  });

  const setBookBataToField = (volumeInfo, kintoneEvent) => {
    // 本の情報をkintoneに設定
    kintoneEvent.record[titleInput].value = volumeInfo.title;
    kintoneEvent.record[authorsInput].value = volumeInfo.authors.join(', ');
    kintoneEvent.record[publishedDateInput].value = volumeInfo.publishedDate;
    kintoneEvent.record[descriptionInput].value = volumeInfo.description;
    kintoneEvent.record[infoLinkInput].value = volumeInfo.infoLink;
    const thumbnailUrl = volumeInfo.imageLinks.thumbnail;
    kintoneEvent.record[thumbnailUrlInput].value = thumbnailUrl;
    document.getElementById(thumbnailWrapper).src = thumbnailUrl;
  };

  // ISBN API 呼び出し Promiseを返却
  const getVolumeInfo = (url) => {
    return new Promise((resolve, reject) => {
      kintone
        .proxy(url, 'GET', {}, {})
        .then((resp) => {
          const bookData = JSON.parse(resp[0]);
          let volumeInfo = '';
          if (bookData.totalItems > 0) {
            volumeInfo = bookData.items[0].volumeInfo;
            const selfLink = bookData.items[0].selfLink;
            kintone.proxy(selfLink, 'GET', {}, {}).then((info) => {
              const description = JSON.parse(info[0]).volumeInfo.description;
              volumeInfo.description = description;
              resolve(volumeInfo);
            });
          } else {
            resolve(volumeInfo);
          }
        })
        .catch((err) => reject(err));
    });
  };

  // PC:ISBN情報を編集したとき
  kintone.events.on(['app.record.create.change.' + barcodeInput, 'app.record.edit.change.' + barcodeInput], (event) => {
    document.getElementById(isbnButton).onclick = () => {
      const isbnCode = event.record[barcodeInput].value;
      if (isbnCode.length === 13) {
        // isbnCode = '9784863544208'
        // APIを呼び出し
        getVolumeInfo(isbnApiUrl + isbnCode).then((volumeInfo) => {
          if (volumeInfo !== '') {
            setBookBataToField(volumeInfo, event);
          } else {
            alert('ISBNコードに対応する本の情報が見つかりませんでした ^^;');
          }
          kintone.app.record.set(event);
        });
      } else {
        alert('ISBN番号は13桁必要です');
      }
    };
  });

  // PC:詳細画面表示
  kintone.events.on(['app.record.detail.show'], (event) => {
    const thumbnailUrl = event.record[thumbnailUrlInput].value;
    const img = document.createElement('img');
    img.id = thumbnailWrapper;
    img.src = thumbnailUrl;
    img.className = 'ui-component-edit-margin';
    kintone.app.record.getSpaceElement(thumbnailWrapper).appendChild(img);
    // スペースフィールドを非表示
    let space = kintone.app.record.getSpaceElement(barcodeWrapper);
    space.parentNode.style.display = 'none';
    space = kintone.app.record.getSpaceElement(barcodeButton);
    space.parentNode.style.display = 'none';
    space = kintone.app.record.getSpaceElement(isbnButton);
    space.parentNode.style.display = 'none';
  });
})();
