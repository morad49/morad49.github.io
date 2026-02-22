import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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
emailjs.init("oqV7lpJJmCVgAnrx6");

let generatedCode = null;

// نظام الثيمات
window.setTheme = function(theme) {
    document.body.className = 'theme-' + theme;
    toggleSidebar();
};

window.toggleSidebar = function() {
    document.getElementById('sidebar').classList.toggle('active');
};

window.showBox = function(id) {
    document.getElementById('registerBox').classList.add('hidden');
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
};

window.handleAuth = async function(type) {
    const btn = (type === 'register') ? document.getElementById('regBtn') : document.getElementById('loginBtn');
    const user = (type === 'register') ? document.getElementById('regUser').value : document.getElementById('loginUser').value;
    const pass = (type === 'register') ? document.getElementById('regPass').value : document.getElementById('loginPass').value;
    let email = "";

    if (!user || !pass) return alert("Fill all fields");
    
    btn.innerText = "AUTHENTICATING...";
    btn.disabled = true;

    if (type === 'register') {
        email = document.getElementById('regEmail').value;
    } else {
        const snap = await getDoc(doc(db, "users", user));
        if (snap.exists() && snap.data().password === pass) email = snap.data().email;
        else { alert("Wrong Access"); btn.disabled = false; return; }
    }

    generatedCode = Math.floor(1000 + Math.random() * 9000);

    emailjs.send("Service_nd6soio", "template_f837clr", {
        to_email: email,
        verification_code: generatedCode
    }).then(() => {
        btn.innerText = "DONE! ✅";
        if (type === 'register') document.getElementById('regVerify').classList.remove('hidden');
        else document.getElementById('login2FA').classList.remove('hidden');
    });
};

window.completeRegister = async function() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const email = document.getElementById('regEmail').value;
    if (document.getElementById('regCodeInput').value == generatedCode) {
        await setDoc(doc(db, "users", user), { username: user, password: pass, email: email });
        showBox('loginBox');
    }
};

window.completeLogin = function() {
    if (document.getElementById('loginCodeInput').value == generatedCode) {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('dirtScreen').classList.remove('hidden');
    }
};
