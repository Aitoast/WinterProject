// import { spawn } from 'https://github.com/nodejs/node/blob/v19.5.0/lib/child_process.js';

import { spawn as a } from 'child_process';
const result = a('py',['test.py']);

result.stdout.on('data', function(data) {
     console.log(data.toString());
 });
 
     // autocomplete 부분을 생성
    // window.onload = function () {
    // autocomplete.setAutocomplete(document.getElementById("stock"), animal)
    // }