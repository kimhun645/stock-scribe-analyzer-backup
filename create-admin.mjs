import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsXLEXI4e_3hoK_Aef6EIOwygxTJGtLek",
  authDomain: "stock-6e930.firebaseapp.com",
  projectId: "stock-6e930",
  storageBucket: "stock-6e930.firebasestorage.app",
  messagingSenderId: "1067364434675",
  appId: "1:1067364434675:web:453eed567f011715586d86"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = 'admin@stockscribe.com';
  const password = 'admin123';

  try {
    console.log('Creating admin user...');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✓ User created with UID:', user.uid);

    const userData = {
      id: user.uid,
      email: user.email,
      displayName: 'Admin',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    console.log('✓ User document created in Firestore');
    console.log('\n✓ Success! Admin user created.\n');
    console.log('You can now login with:');
    console.log('Email: admin@stockscribe.com');
    console.log('Password: admin123');

    process.exit(0);

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠ User already exists!');
      console.log('\nYou can login with:');
      console.log('Email: admin@stockscribe.com');
      console.log('Password: admin123');
      process.exit(0);
    } else {
      console.error('\n✗ Error:', error.message);
      process.exit(1);
    }
  }
}

createAdmin();