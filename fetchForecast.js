(() => {
  'use strict';
  // レコード一覧画面の表示後イベント
  kintone.events.on('app.record.index.show', (event) => {
    if (document.getElementById('fetch-forecast-button') !== null) {
      return;
    }

    // button
    const fetchForecastButton = document.createElement('button');
    fetchForecastButton.id = 'fetch-forecast-button';
    fetchForecastButton.innerText = '今日の富山県の天気';
    fetchForecastButton.className = 'kintoneplugin-button-normal';
    kintone.app.getHeaderMenuSpaceElement().appendChild(fetchForecastButton);

    // ボタンクリック時の処理
    fetchForecastButton.onclick = fetchToyamaForecast;

    // 富山の天気予報を取得してアラートに表示する
    function fetchToyamaForecast() {
      kintone.proxy('https://www.jma.go.jp/bosai/forecast/data/forecast/160000.json',
        'GET',
        {'Content-Type': 'application/json'},
        {}).then(args => {
        // success
        /*  args[0] -> body(文字列)
         *  args[1] -> status(数値)
         *  args[2] -> headers(オブジェクト)
         */
        const foracastData = JSON.parse(args[0]);
        // console.log(args[1], foracastData, args[2]);
        // console.log(foracastData);
        // console.log(foracastData[0].timeSeries[0].areas[0].weathers[0]);
        const eastToyama = foracastData[0].timeSeries[0].areas[0].weathers[0];
        const westToyama = foracastData[0].timeSeries[0].areas[1].weathers[0];
        const forecastToyama = `今日の富山県の天気は\n東部: ${eastToyama}\n西部: ${westToyama}`;
        alert(forecastToyama);
      }, (error) => {
        // error
        console.log(error); // proxy APIのレスポンスボディ(文字列)を表示
      });
    }

  });

})();
