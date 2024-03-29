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
export { notify, baseUrl};
