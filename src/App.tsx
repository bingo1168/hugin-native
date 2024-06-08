import '../shim';

import React from 'react';
// Maybe https://wix.github.io/react-native-notifications/api/general-api/
// import PushNotificationIOS from '@react-native-community/push-notification-ios'; // TODO iOS
// import PushNotification, {
//   PushNotificationObject,
// } from 'react-native-push-notification';

import { RootNavigator } from '@/components';

import { AppProvider } from './contexts';

// import SplashScreen from 'react-native-splash-screen';
// import { useEffect } from 'react';
const App = () => {
  // const [showSplash, setShowSplash] = useState(true);
  // useEffect(() => {
  //   init();
  //   setTimeout(() => {
  //     setShowSplash(false);
  //   }, 3000);
  // }, []);

  // useEffect(() => {
  //   // Configure Push Notification
  //   PushNotification.configure({
  //     // (required) Called when a remote or local notification is opened or received
  //     onNotification: function (notification) {
  //       console.log('NOTIFICATION:', notification);

  //       // Process the notification
  //       handleNotification(notification);

  //       // Required on iOS only
  //       //  notification.finish(PushNotificationIOS.FetchResult.NoData);
  //     },

  //     // (optional) Called when Token is generated (iOS and Android)
  //     onRegister: function (token) {
  //       console.log('TOKEN:', token);
  //     },

  //     // iOS only
  //     permissions: {
  //       alert: true,
  //       badge: true,
  //       sound: true,
  //     },

  //     popInitialNotification: true,

  //     requestPermissions: true,
  //     // Android only: GCM or FCM Sender ID
  //     senderID: 'YOUR GCM (OR FCM) SENDER ID',
  //   });
  // }, []);
  // if (showSplash) {
  //   return (
  //     <ScreenLayout>
  //       <XKRLogo />
  //     </ScreenLayout>
  //   );
  // } else {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
  // }
};

// function handleNotification(notification: PushNotificationObject) {
//   if (notification.transaction != undefined) {
//     return;
//   }

//   let payee = notification.userInfo;

//   if (payee.address) {
//     payee = new URLSearchParams(payee).toString();

//     const url = 'xkr://'.replace('address=', '') + payee;

//     Linking.openURL(url);
//   } else if (payee.key) {
//     const url = `xkr://?group=${payee.key}`;

//     Linking.openURL(url);
//   } else {
//     const url = 'xkr://?board=' + payee;

//     Linking.openURL(url);
//   }
// }

export default App;
