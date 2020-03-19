const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  buttonSearch = formSearch.querySelector('.button__search');

let city = [];

function cityCode(input) {
  let value = input.value;
  let code = value.match(/(\w)/g);
  let fullCode = `${code[0]}${code[1]}${code[2]}`
  return fullCode;
}

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  price = 'http://api.travelpayouts.com/v2/prices/latest?'
  proxy = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = 'c44cc5c4b70940bdc6b939c2395cdd2c';

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open('GET', url);

  request.addEventListener('readystatechange', () => {
    if(request.readyState !== 4) return;

    if(request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status)
    }
  });

  request.send();
};

const showCity = (input, list) => {
  list.textContent = '';
  if(input.value !== '') {
    const filterCity = city.filter((item) => {
      if (item.name) {
        const fixItem = item.name.toLowerCase();
        return (
          fixItem.includes(input.value.toLowerCase())
        )
      }
    });
    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = `${item.name}(${item.code})`;
      list.append(li);
    });
  }
}

const selectCity = (event, input, list) => {
  const target = event.target;
  if(target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
}

inputCitiesFrom.addEventListener('input', () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (event) => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

buttonSearch.addEventListener('click', () => {
  let getPrice = `${price}origin=${cityCode(inputCitiesFrom)}&destination=${cityCode(inputCitiesTo)}&beginning_of_period=${inputDateDepart.value}&one_way=true&token=${API_KEY}`;

  getData(getPrice, (data) => {
    console.log(data)
  })
})

getData(proxy + citiesApi, (data) => {
  city = JSON.parse(data);
})

let getPrice = `${price}origin=SVX&destination=KGD&beginning_of_period=2020-05-25&one_way=true&token=${API_KEY}`;

getData(getPrice, (data) => {
  console.log(data)
})