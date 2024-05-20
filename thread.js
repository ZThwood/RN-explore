import {self} from 'react-native-threads';
const tag = '[Thread Manger: self]';

function fb(n) {
  if (n == 1 || n == 2) {
    return 1;
  }
  return fb(n - 1) + fb(n - 2);
}

try {
  const startTime = Date.now();

  fb(40);
  // listen for messages
  self.onmessage = message => {
    console.log('self onmessage:', message);
  };

  // send a message, strings only
  const end = Date.now() - startTime;

  self.postMessage(end.toString());
} catch (error) {
  self.postMessage(JSON.stringify(error));
  console.log(' thead1 self error', error);
}
