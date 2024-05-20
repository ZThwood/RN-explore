import {self} from 'react-native-threads';

try {
  function fb(n) {
    if (n == 1 || n == 2) {
      return 1;
    }
    return fb(n - 1) + fb(n - 2);
  }
  fb(40);

  // listen for messages
  self.onmessage = message => {
    console.log('self onmessage:', message);
  };

  // send a message, strings only
  self.postMessage('thead1 self post');
} catch (error) {
  self.postMessage(JSON.stringify(error));
  console.log(' thead1 self error', error);
}
