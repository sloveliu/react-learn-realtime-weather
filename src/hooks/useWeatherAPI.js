import { useState, useEffect, useCallback } from "react";
const gasUrl = "https://script.google.com/macros/s/AKfycbyxxNjLiyxRxPqZRqCkf5i-KorOfOAv-AKlN3RicEvBA7xXmq0ATe_CAeDPR-zIOLiC_g/exec";

const fetchCurrentWeather = (locationName) => {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?locationName=${locationName}`;
  return fetch(`${gasUrl}?url=${url}`)
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        if (['WDSD', 'TEMP', 'Weather'].includes(item.elementName)) {
          neededElements[item.elementName] = item.elementValue;
        }
        return neededElements;
      }, {});
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
      };
    });
};

const fetchWeatherForecast = ({ cityName }) => {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?&locationName=${cityName}`;
  return fetch(`${gasUrl}?url=${url}`)
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
      }, {});
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const useWeatherAPI = ({ locationName, cityName }) => {
  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    observationTime: new Date(),
    weatherCode: 0,
    comfortability: '',
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setWeatherElement(prevState => ({
      ...prevState,
      isLoading: true
    }));
    // fetchCurrentWeather(), fetchWeatherForecast() 不依賴 useState 後，就可以放在 App 元件外
    const [currentWeather, weatherForecast] = await Promise.all([fetchCurrentWeather(locationName), fetchWeatherForecast(cityName)]);
    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    });
    // 這三個變數有變化時就重新執行
  }, [cityName, locationName]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherAPI;