import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB7oGrcD1ShriCYTP_0_vMPdPkkmd2GfwU",
    authDomain: "dirtmc-7c068.firebaseapp.com",
    projectId: "dirtmc-7c068",
    storageBucket: "dirtmc-7c068.firebasestorage.app",
    messagingSenderId: "808909665625",
    appId: "1:808909665625:web:0aa7aaad9c31dc0e0d4848"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تأكد من صحة هذه المفاتيح من EmailJS Dashboard
const SERVICE_ID = "Service_nd6soio"; 
const TEMPLATE_ID = "template_f837clr";
const PUBLIC_KEY = "oqV7lpJJmCVgAnrx6";

emailjs.init(PUBLIC_KEY);

let generatedCode = null;

// ربط الدوال بالـ Window ليراها ملف الـ HTML
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

window.setTheme = (theme) => {
    document.body.className = 'theme-' + theme;
    window.toggleSidebar();
};

window.showBox = (id) => {
    document.getElementById('registerBox').classList.add('hidden');
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
};

window.handleAuth = async (type) => {
    const btn = document.getElementById(type === 'register' ? 'regBtn' : 'loginBtn');
    const user = document.getElementById(type === 'register' ? 'regUser' : 'loginUser').value;
    const pass = document.getElementById(type === 'register' ? 'regPass' : 'loginPass').value;
    let email = "";

    if (!user || !pass) return alert("All fields are required.");

    btn.innerText = "VERIFYING...";
    btn.disabled = true;

    if (type === 'register') {
        email = document.getElementById('regEmail').value;
        if(!email) { btn.disabled = false; btn.innerText="GET ACCESS CODE"; return alert("Email missing"); }
    } else {
        const snap = await getDoc(doc(db, "users", user));
        if (snap.exists() && snap.data().password === pass) {
            email = snap.data().email;
        } else {
            alert("Credentials Error."); btn.disabled = false; btn.innerText="RETRY"; return;
        }
    }

    generatedCode = Math.floor(1000 + Math.random() * 9000);

    // عملية الإرسال
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: email,
        verification_code: generatedCode
    }).then(() => {
        btn.innerText = "SENT! ✅";
        document.getElementById(type === 'register' ? 'regVerify' : 'login2FA').classList.remove('hidden');
    }).catch((err) => {
        console.error("EmailJS Error:", err);
        alert("ERROR: Check your Service ID or Template ID in script.js");
        btn.disabled = false;
        btn.innerText = "RETRY";
    });
};

window.completeRegister = async () => {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const email = document.getElementById('regEmail').value;
    const inputCode = document.getElementById('regCodeInput').value;
    
    if (inputCode == generatedCode) {
        await setDoc(doc(db, "users", user), { username: user, password: pass, email: email });
        alert("Registered! Now Login.");
        window.showBox('loginBox');
    } else alert("Code Mismatch.");
};

window.completeLogin = () => {
    const inputCode = document.getElementById('loginCodeInput').value;
    if (inputCode == generatedCode) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('dirtScreen').style.display = 'flex';
    } else alert("Unauthorized Code.");
};
