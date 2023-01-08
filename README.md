# learn-realtime-weather

部署在 Github： <https://sloveliu.github.io/learn-realtime-weather/>

## React Hook 練習

### 先申請 API Key 填入 .env

<https://opendata.cwb.gov.tw/userLogin>

.env

```js
REACT_APP_API_AUTHORIZATION_KEY=xxx
```

### 啟動

```js
npm start
```

### 使用的 hook

- useState：定義狀態、改變狀態，觸發渲染。觸發渲染條件  set 有被呼叫 且 state 實際有改變。範例：當 state 不存在值，會去 localStorage 取得，不存在則給予預設值【臺中市】

```js
const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('cityName') || '臺中市');
```

- props：元件傳遞，將父層變數、函式傳給子層。範例：判斷 currentPage 值，顯示指定元件並傳入變數或函式給子層 WeatherCard / WeatherSetting，子層元件再透過解構取得變數。

App.js

```js
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {
          currentPage === 'WeatherCard' &&
          <WeatherCard
            cityName={cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange} />
        }
        {currentPage === 'WeatherSetting' &&
          <WeatherSetting
            cityName={cityName}
            handleCurrentPageChange={handleCurrentPageChange}
            handleCurrentCityChange={handleCurrentCityChange} />}
      </Container>
    </ThemeProvider>
  );

```

views/WeatherCard.js

```js
const WeatherCard = ({ cityName, weatherElement, moment, fetchData, handleCurrentPageChange }) => {
  const {
    observationTime,
    windSpeed,
    temperature,
    rainPossibility,
    description,
    comfortability,
    isLoading,
    weatherCode
  } = weatherElement;
  ...
};
```

- useEffect：監聽變數，當頁面初次載入或依賴陣列內容改變時就執行工作。範例：當 fetchData 有變化時執行 fetchData() 獲取天氣狀況。

```js
  useEffect(() => { fetchData(); }, [fetchData]);
```

- useCallback：記憶函式，避免每次渲染都會重新宣告函式，導致 component 毫無意義的重新 render。

```js
  const fetchData = useCallback(async () => {
    setWeatherElement(prevState => ({
      ...prevState,
      isLoading: true
    }));
    const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather({ authorizationKey, locationName }), fetchWeatherForecast({ authorizationKey, cityName })]);
    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    });
    // 這三個變數有變化時就重新執行
  }, [authorizationKey, cityName, locationName]);
```

- useMemo：避免不必要的重複運算。範例：當碰到 state 改變導致畫面更新，weatherCode 沒有變，卻要重新調用 weatherCodeToType Function 取得相同結果就多餘了。

```js
const WeatherIcon = ({ weatherCode, moment }) => {
  const weatherType = useMemo(() => weatherCodeToType(weatherCode),[weatherCode])
  const weatherIcon = weatherIcons[moment][weatherType];
  return (
    <IconContainer>
      {weatherIcon}
    </IconContainer>
  );
};
```

- useRef：操作表單上的元素，透過 useRef 取得的物件不會隨著每次渲染而不同，完全獨立於 React 元件的變數，也不會觸發 React 重新渲染

- custom hook：可以把複雜的程式抽到 Hook 內，讓多個元件重複使用，或者打包起來變成共用邏輯。範例把 API 操作拆到獨立檔案可以共用。

hooks/useWeatherAPI.js

```js
import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
  ...
};

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  ...
};

const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {
  const [weatherElement, setWeatherElement] = useState({
    ...
  });

  const fetchData = useCallback(async () => {
    ...
  }, [authorizationKey, cityName, locationName]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherAPI;
```

App.js

```js
import useWeatherAPI from './hooks/useWeatherAPI';

const App = () => {
  ...
  const [weatherElement, fetchData] = useWeatherAPI({ locationName, cityName, authorizationKey: AUTHORIZATION_KEY });
  ...
};

```

### 其他

- ThemeProvider：提供主題樣式
- Styled：CSS in JS
- localStorage：用 key value 形式將資料存在本地，格式是 string。
