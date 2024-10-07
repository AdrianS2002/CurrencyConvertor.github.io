const dropList = document.querySelectorAll("form select"),
fromCurrency = document.getElementById('from'),
toCurrency = document.getElementById('to'),
getButton = document.querySelector("form button");


for (let i = 0; i < dropList.length; i++) {
    for(let currency_code in country_list){
        
        let selected = i == 0 ? currency_code == "USD" ? "selected" : "" : currency_code == "RON" ? "selected" : "";
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e =>{
        loadFlag(e.target); 
    });
}


function loadFlag(element){
    for(let code in country_list){
        if(code == element.value){ 
            let imgTag = element.parentElement.querySelector("img"); 
            imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
        }
    }
}

window.addEventListener("load", ()=>{
    getExchangeRate();
});

getButton.addEventListener("click", e =>{
    e.preventDefault();
    getExchangeRate();
});

function getExchangeRate(){
    const amount = document.getElementById("amount");
    const exchangeRateTxt = document.querySelector("#result");
    let amountVal = amount.value;

    if(amountVal == "" || amountVal == "0"){
        amount.value = "1";
        amountVal = 1;
    }
    exchangeRateTxt.innerText = "Getting exchange rate...";
    let url = `https://v6.exchangerate-api.com/v6/9347f20e3dd5a74d4667b4ff/latest/${fromCurrency.value}`;
   
    fetch(url).then(response => response.json()).then(result =>{
        let exchangeRate = result.conversion_rates[toCurrency.value]; 
        let totalExRate = (amountVal * exchangeRate).toFixed(2); 
        exchangeRateTxt.value = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;

    }).catch(() =>{ 
        exchangeRateTxt.innerText = "Something went wrong";
    });
}
