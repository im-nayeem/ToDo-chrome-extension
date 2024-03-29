const baseUrl = "http://localhost:8089/";

const notify = (type, desc) => {
    chrome.notifications.create("notificationId", {
        type: 'basic',
        title: `ToDo - ${type}`,
        message: desc,
        iconUrl: 'assets/logo.png'
      }, (notificationId) => {
        setTimeout(() => {
          chrome.notifications.clear(notificationId);
        }, 6000);
      });
};


const isInternetConnected = (callback) => {
  fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors'})
      .then(response => {
          callback(true);
          console.log("Connected to internet...");
      })
      .catch(error => {
          callback(false);
          console.log("Can't connect to the internet...");
      });
}

export { notify, baseUrl, isInternetConnected};
