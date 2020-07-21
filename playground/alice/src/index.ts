import SyncStorage from '../../../src/index';

const client = new SyncStorage.client('http://localhost:3001/index.html');

const setKey1 = () => client.onConnect().then(() => client.set('key1', 'foo'));
const setKey2 = () => client.onConnect().then(() => client.set('key2', 'bar'));
const getKey1 = () => client.onConnect().then(() => {
  client.get('key1').then((res) => {
    console.log(res)
    alert(res)
  });
});
const getKey2 = () => client.onConnect().then(() => {
  client.get('key2').then((res) => alert(res));
});

const clear = () => {
  client.onConnect().then(() => {
    client.clear();
  });
};


const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const button4 = document.getElementById('button4');
const button5 = document.getElementById('button5');

button1.addEventListener('click', setKey1);
button2.addEventListener('click', setKey2);
button3.addEventListener('click', getKey1);
button4.addEventListener('click', getKey2);
button5.addEventListener('click', clear);
