// background.js


chrome.runtime.onInstalled.addListener( async () => {
    setInterval(() => {
        chrome.tabs.query({active : true}).then(tabs => test(tabs));
    }, 1000);
    chrome.tabs.query({active : true}).then(tabs => test(tabs));
    async function test(tabs) {
        console.log("start")
        let test;
        await  fetch(`http://localhost:1234/test`).then(response => response.json().then(data => test = data))
    
       let data = test.data.passwords
     /*  let service = document.getElementById('service')
       let username = ducument.getElementById('username')
       let password = document.getElementById('password')*/
        // console.log(data)
         const url = tabs[0].url;
         result = url.replace(/(^\w+:|^)\/\//, '');
      //   console.log(data)
         if(data.length === 0){
            //ducument.getElementById('test').innerText = `geen data length`
         }
     var arrayLength = data.length;
     for (var i = 0; i < arrayLength; i++) {
        if(result.includes(data[i].service)){
         /*   password.value = data[i].password
            service.value = data[i].service
            username.value = data[i].username*/
            console.log(data[i].service)
            console.log(data[i].username)
            console.log(data[i].password)
        }
       //console.log(data[i]);
        // document.getElementById('test').innerText = data[i]
         //Do something
     }
       // document.getElementById('test').innerText = url
    }
});
/*
    "background": {
      "service_worker": "background.js"
    },*/