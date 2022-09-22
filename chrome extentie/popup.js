async function ge123123() {
    let test;
    await fetch(`http://localhost:1234/test`).then(response => response.json().then(data => test = data))
    let test2 = JSON.stringify(test, undefined, 2);

}
let servicee = document.getElementById('service')
let usernamee = document.getElementById('username')
let passwordd = document.getElementById('password')
let error = document.getElementById('error')
chrome.tabs.query({active : true}).then(tabs => getData(tabs));
document.getElementById('copy').addEventListener("click", function() {
    var textArea = document.createElement("textarea");
    textArea.value = passwordd.value;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
  });


async function getData(tabs) {
    let test;
    await  fetch(`http://localhost:1234/test`).then(response => response.json().then(data => test = data))

   let data = test.data.passwords

    // console.log(data)
     const url = tabs[0].url;
     result = url.replace(/(^\w+:|^)\/\//, '');
  //   console.log(data)
     if(data.length === 0){
        error.innerText = `Geen password gevonden`
     }
 var arrayLength = data.length;
 for (var i = 0; i < arrayLength; i++) {
    if(result.includes(data[i].service)){
        error.innerText = ''
        passwordd.value = data[i].password
        servicee.value = data[i].service
        usernamee.value = data[i].username
        
    }
    //console.log(data[i]);
    // document.getElementById('test').innerText = data[i]
     //Do something
 }
   // document.getElementById('test').innerText = url
}

