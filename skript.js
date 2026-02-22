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

// تهيئة EmailJS
emailjs.init("oqV7lpJJmCVgAnrx6");

let generatedCode = null;

// حركة التنقل بين واجهة الدخول والتسجيل
window.showBox = function(id) {
    document.querySelectorAll('.auth-container').forEach(c => c.classList.add('hidden'));
    const targetBox = document.getElementById(id);
    targetBox.classList.remove('hidden');
    targetBox.classList.add('fade-in');
};

window.handleAuth = async function(type) {
    const user = (type === 'register') ? document.getElementById('regUser').value : document.getElementById('loginUser').value;
    const pass = (type === 'register') ? document.getElementById('regPass').value : document.getElementById('loginPass').value;
    const btn = (type === 'register') ? document.getElementById('regBtn') : document.getElementById('loginBtn');
    let email = "";

    if (!user || !pass) return alert("System requires full credentials.");
    
    // تأثير الزر أثناء المعالجة
    btn.disabled = true;
    btn.innerText = "PROCESSING...";

    if (type === 'register') {
        email = document.getElementById('regEmail').value;
        if (!email) { btn.disabled = false; btn.innerText = "GET ACCESS CODE"; return alert("Email Required."); }
    } else {
        try {
            const userRef = doc(db, "users", user);
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().password === pass) {
                email = snap.data().email;
            } else {
                alert("Access Denied: Invalid Credentials.");
                btn.disabled = false; btn.innerText = "REQUEST 2FA";
                return;
            }
        } catch(e) { 
            alert("Database Offline."); 
            btn.disabled = false; 
            btn.innerText = "REQUEST 2FA";
            return; 
        }
    }

    generatedCode = Math.floor(1000 + Math.random() * 9000);

    emailjs.send("Service_nd6soio", "template_f837clr", {
        to_email: email,
        verification_code: generatedCode
    }).then(() => {
        // الأنيميشن وتغيير الزر بعد نجاح الإرسال
        btn.innerText = "DONE! ✅"; 
        btn.style.background = "transparent";
        btn.style.border = "2px solid #00ff66";
        btn.style.color = "#00ff66";
        btn.style.boxShadow = "none";
        
        // إظهار حقل الـ 2FA بحركة Slide Down
        if (type === 'register') {
            document.getElementById('regVerify').classList.remove('hidden');
        } else {
            document.getElementById('login2FA').classList.remove('hidden');
        }
    }).catch((err) => {
        alert("Communication Error.");
        btn.disabled = false;
        btn.innerText = "RETRY";
    });
};

window.completeRegister = async function() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const email = document.getElementById('regEmail').value;
    
    if (document.getElementById('regCodeInput').value == generatedCode) {
        await setDoc(doc(db, "users", user), { username: user, password: pass, email: email });
        alert("Archive Created Successfully!");
        showBox('loginBox');
    } else {
        alert("Invalid 2FA Code.");
    }
};

window.completeLogin = function() {
    if (document.getElementById('loginCodeInput').value == generatedCode) {
        document.getElementById('loginBox').classList.add('hidden');
        const dirtScreen = document.getElementById('dirtScreen');
        dirtScreen.classList.remove('hidden');
        dirtScreen.style.display = 'flex';
    } else {
        alert("Unauthorized Access Code.");
    }
};
