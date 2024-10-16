const dropList = document.querySelectorAll("form select"),
    fromCurrency = document.getElementById('from'),
    toCurrency = document.getElementById('to'),
    getButton = document.querySelector("form button");
let errorMessage = document.createElement('p');
errorMessage.style.color = 'red';


for (let i = 0; i < dropList.length; i++) {
    for (let currency_code in country_list) {
        let selected = i == 0 ? currency_code == "USD" ? "selected" : "" : currency_code == "RON" ? "selected" : "";
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e => {
        loadFlag(e.target);
    });
}

function loadFlag(element) {
    for (let code in country_list) {
        if (code == element.value) {
            let imgTag = element.parentElement.querySelector("img");
            imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
        }
    }
}

window.addEventListener("load", () => {
    getExchangeRate();
});

getButton.addEventListener("click", e => {
    e.preventDefault();
    getExchangeRate();

});
function getExchangeRate() {
    console.log('getExchangeRate() called');
    
    const exchangeRateTxt = document.querySelector("#result");
    let amountVal = document.getElementById('amount').value;

    if (amountVal == "") {
        amountVal = 1;
    }
    if (amountVal == "0" || amountVal < 0) {
        console.log('Invalid amount entered');
        errorMessage.innerText = "Please enter a valid amount";
        document.getElementById('amount').insertAdjacentElement("afterend", errorMessage);
        exchangeRateTxt.value = '';
        return;
    }

    console.log('Valid amount:', amountVal);

    errorMessage.innerText = "";
    exchangeRateTxt.innerText = "Getting exchange rate...";

    // Verifică dacă ratele de schimb sunt stocate în localStorage
    let storedData = localStorage.getItem('exchangeRates');
    if (storedData) {
        console.log('Data found in localStorage');
        storedData = JSON.parse(storedData);
        const lastUpdate = new Date(storedData.lastUpdate);
        const currentTime = new Date();
        const oneDay = 24 * 60 * 60 * 1000; // O zi în milisecunde

        if ((currentTime - lastUpdate) < oneDay) {
            console.log('LocalStorage data is still valid');
            if (storedData.rates[fromCurrency.value] && storedData.rates[fromCurrency.value][toCurrency.value]) {
                let exchangeRate = storedData.rates[fromCurrency.value][toCurrency.value];
                let totalExRate = (amountVal * exchangeRate).toFixed(2);
                exchangeRateTxt.value = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
                return;
            }
        }
    }

    console.log('Fetching data from API...');
    
    // Dacă datele nu sunt în localStorage sau sunt expirate, fă o cerere API
    fetchAllExchangeRates().then(result => {
        console.log('Data fetched from API:', result);
        if (result[fromCurrency.value] && result[fromCurrency.value][toCurrency.value]) {
            let exchangeRate = result[fromCurrency.value][toCurrency.value];
            let totalExRate = (amountVal * exchangeRate).toFixed(2);
            exchangeRateTxt.value = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
        } else {
            exchangeRateTxt.innerText = "Conversion not available for selected currencies";
        }
    }).catch(() => {
        exchangeRateTxt.innerText = "Something went wrong";
    });
}


async function fetchAllExchangeRates() {
    let url = `https://v6.exchangerate-api.com/v6/9347f20e3dd5a74d4667b4ff/latest/USD`; // Fetch all rates relative to USD
    const response = await fetch(url);
    
    const result = await response.json();
    
    // Verifică dacă există date valide înainte de a stoca
    if (result && result.conversion_rates) {
        // Adaugă ratele și timestamp în localStorage
        let newRates = {
            rates: {},
            lastUpdate: new Date().toISOString() // Salvează timestamp-ul curent
        };

        // Stochează ratele relative la USD
        newRates.rates['USD'] = result.conversion_rates;

        // Creează rate pentru toate valutele relativ la orice altă valută
        for (let base in result.conversion_rates) {
            newRates.rates[base] = {};
            for (let target in result.conversion_rates) {
                newRates.rates[base][target] = (result.conversion_rates[target] / result.conversion_rates[base]).toFixed(6);
                console.log(newRates.rates[base][target]);
            }
        }

        localStorage.setItem('exchangeRates', JSON.stringify(newRates));

        return newRates.rates;
    } else {
        throw new Error("Invalid API response");
    }
}
