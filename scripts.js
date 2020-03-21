const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  buttonSearch = formSearch.querySelector('.button__search'),
  cheapestTicket = document.getElementById('cheapest-ticket'),
  otherCheapTickets = document.getElementById('other-cheap-tickets');

let city = [];

function cityCode(input) {
  let value = input.value;
  let code = value.match(/(\w)/g);
  let fullCode = `${code[0]}${code[1]}${code[2]}`
  return fullCode;
}

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = 'c44cc5c4b70940bdc6b939c2395cdd2c',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_COUNT = 5;

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
//вывод городов
const showCity = (input, list) => {
  list.textContent = '';
  if(input.value !== '') {
    const filterCity = city.filter((item) => {
      if (item.name) {
        const fixItem = item.name.toLowerCase();
        return fixItem.startsWith(input.value.toLowerCase());//startsWith - новый метод сортировки
      }
    });
    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = item.name;
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

const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code);
  return objCity.name;
}

const getDate = (data) => {
  return new Date(data).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getChanges = (num) => {
  if (num) {
    return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
  } else {
    return 'Без пересадок'
  }
};

const getLinkAviasales = (data) => {
  let link = 'https://www.aviasales.ru/search/';
  link += data.origin;
  const date = new Date(data.depart_date);
  const day = date.getDate();
  const month = date.getMonth();
  link += day < 10 ? '0' + day : day;
  link += month < 10 ? '0' + month : month;
  link += data.destination;
  link += '1';

  return link;
}

const createCard = (data) => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  let deep = '';

  if(data) {
    deep = `
      <h3 class="agent">${data.gate}</h3>
      <div class="ticket__wrapper">
        <div class="left-side">
          <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
            за ${data.value}₽</a>
        </div>
        <div class="right-side">
          <div class="block-left">
            <div class="city__from">Вылет из города
              <span class="city__name">${getNameCity(data.origin)}</span>
            </div>
            <div class="date">${getDate(data.depart_date)}</div>
          </div>

          <div class="block-right">
            <div class="changes">${getChanges(data.number_of_changes)}</div>
            <div class="city__to">Город назначения:
              <span class="city__name">${getNameCity(data.destination)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    deep = '<h3>Билетов не нашлось</h3>';
  }

  ticket.insertAdjacentHTML('afterbegin', deep)

  return ticket;
}

const renderCheap = (response, date) => {
  const cheapTicketYear = JSON.parse(response).best_prices;

  const cheapTicketDay = cheapTicketYear.filter((item) => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketDay);
  renderCheapYear(cheapTicketYear);
};

const renderCheapDay = (cheapTicket) => {
  cheapestTicket.style.display = 'block';
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
  
  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
}

const renderCheapYear = (cheapTickets) => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
  cheapTickets.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    return 0;
  });
  for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }
}
//обработчики событий
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

formSearch.addEventListener('submit', (event) => {
  event.preventDefault();

  const cityFrom = city.find((item) => {
    return inputCitiesFrom.value === item.name;
  });
  const cityTo = city.find((item) => {
    return inputCitiesTo.value === item.name;
  });
  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDateDepart.value,
  }
  if (formData.from && formData.to) {
    const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true&token=${API_KEY}`;

    getData(calendar + requestData, (response) => {
      renderCheap(response, formData.when);
    })
  } else {
    alert('Введите правильное название города');
  }
})

getData(proxy + citiesApi, (data) => {
  city = JSON.parse(data).filter(item => item.name);
  //сортировка городов
  city.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });
});
