// Lazy Firebase - carrega sob demanda para performance
let firebasePromise = null;
let dbInstance = null;

export const initFirebaseLazy = async () => {
  if (firebasePromise) return firebasePromise;
  
  firebasePromise = (async () => {
    console.log('🔥 Inicializando Firebase sob demanda...');
    
    const [
      { initializeApp },
      { getFirestore }
    ] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore')
    ]);

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: "1073104197604",
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    
    console.log('✅ Firebase inicializado com sucesso!');
    return dbInstance;
  })();
  
  return firebasePromise;
};

export const getFirestoreLazy = async () => {
  if (dbInstance) return dbInstance;
  return await initFirebaseLazy();
};

// Hook para componentes React
export const useFirestore = () => {
  const [db, setDb] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    getFirestoreLazy().then(firestore => {
      setDb(firestore);
      setLoading(false);
    });
  }, []);
  
  return { db, loading };
};