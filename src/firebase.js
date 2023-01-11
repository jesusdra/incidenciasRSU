import { initializeApp } from 'firebase/app'

import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCQr1gDn6X0-UKtT_A_5-vydt5YxV6_7e8',
  authDomain: 'gestionrsu-f5648.firebaseapp.com',
  databaseURL: 'https://gestionrsu-f5648-default-rtdb.firebaseio.com',
  projectId: 'gestionrsu-f5648',
  storageBucket: 'gestionrsu-f5648.appspot.com',
  messagingSenderId: '597299754002',
  appId: '1:597299754002:web:f57de4a040d2c3a57ed4cb'
}

const FirebaseApp = initializeApp(firebaseConfig)

export const db = getFirestore(FirebaseApp)