const D_KEY='dirt_accounts_v1';
const LOG_KEY='dirt_logged_in';

function loadAccounts(){
  return JSON.parse(localStorage.getItem(D_KEY)||'{}');
}

function saveAccounts(obj){
  localStorage.setItem(D_KEY,JSON.stringify(obj));
}

async function sha256(str){
  const buf=new TextEncoder().encode(str);
  const hash=await crypto.subtle.digest('SHA-256',buf);
  return Array.from(new Uint8Array(hash))
    .map(b=>b.toString(16).padStart(2,'0'))
    .join('');
}

function setLogged(email,remember){
  if(remember) localStorage.setItem(LOG_KEY,email);
  else sessionStorage.setItem(LOG_KEY,email);
}

function getLogged(){
  return localStorage.getItem(LOG_KEY) ||
         sessionStorage.getItem(LOG_KEY);
}

function clearLogged(){
  localStorage.removeItem(LOG_KEY);
  sessionStorage.removeItem(LOG_KEY);
}

function updateUI(){
  const user=getLogged();
  document.getElementById('welcomeText').textContent =
    user ? user : 'مرحبا — زائر';
}

document.getElementById('openRegister').onclick =
  ()=>authModal.style.display='flex';

document.getElementById('gotoLogin').onclick = ()=>{
  registerBox.style.display='none';
  loginBox.style.display='block';
};

document.getElementById('gotoRegister').onclick = ()=>{
  loginBox.style.display='none';
  registerBox.style.display='block';
};

document.getElementById('logoutBtn').onclick = ()=>{
  clearLogged();
  updateUI();
};

document.getElementById('openBackup').onclick =
  ()=>backupModal.style.display='flex';

document.getElementById('closeBackup').onclick =
  ()=>backupModal.style.display='none';

document.getElementById('doRegister').onclick = async ()=>{
  const email=regEmail.value.trim().toLowerCase();
  const pass=regPass.value;
  const user=regUser.value;

  if(!email||!pass) return alert('Fill fields');

  const accs=loadAccounts();
  if(accs[email]) return alert('Account exists');

  accs[email]={
    passwordHash:await sha256(pass),
    username:user
  };

  saveAccounts(accs);
  setLogged(email,remember.checked);
  updateUI();
  authModal.style.display='none';
};

document.getElementById('doLogin').onclick = async ()=>{
  const email=loginEmail.value.trim().toLowerCase();
  const pass=loginPass.value;

  const accs=loadAccounts();
  if(!accs[email]) return alert('No account');

  if(await sha256(pass)!==accs[email].passwordHash)
    return alert('Wrong password');

  setLogged(email,rememberLogin.checked);
  updateUI();
  authModal.style.display='none';
};

document.getElementById('doExport').onclick = ()=>{
  const email=getLogged();
  if(!email) return alert('Login first');

  backupOut.value =
    btoa(JSON.stringify(loadAccounts()[email]));
};

document.getElementById('doImport').onclick = ()=>{
  try{
    const data=
      JSON.parse(atob(backupIn.value));

    const email=prompt('Enter email');
    const accs=loadAccounts();
    accs[email]=data;
    saveAccounts(accs);
    alert('Imported');
  }catch{
    alert('Invalid backup');
  }
};

hamburger.onclick =
  ()=>themeMenu.classList.toggle('show');

document.querySelectorAll('.opt')
.forEach(el=>{
  el.onclick=()=>{
    const t=el.dataset.theme;

    document.body.classList.remove(
      'theme-night','theme-sun'
    );

    splitWrap.style.display='none';

    if(t==='night')
      document.body.classList.add('theme-night');

    if(t==='sun')
      document.body.classList.add('theme-sun');

    if(t==='both')
      splitWrap.style.display='block';
  };
});

discordLink.onclick =
  ()=>window.open('https://discord.gg/dirtmc','_blank');

updateUI();
