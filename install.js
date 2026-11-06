(()=>{
  const APP_HOST="app.aeliaai.org.ng";
  if(location.hostname.toLowerCase()!==APP_HOST){
    if("serviceWorker"in navigator)navigator.serviceWorker.getRegistrations().then(registrations=>registrations.filter(reg=>new URL(reg.active?.scriptURL||reg.installing?.scriptURL||reg.waiting?.scriptURL||location.href).origin===location.origin&&reg.scope===location.origin+"/"&&reg.active?.scriptURL.endsWith("/sw.js")).forEach(reg=>reg.unregister())).catch(()=>{});
    return;
  }
  document.querySelectorAll("[data-current-year]").forEach(el=>el.textContent=String(new Date().getFullYear()));
  let installPrompt=null;
  const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
  const addButton=()=>{
    const host=document.querySelector(".top-actions")||document.querySelector(".oa-nav-actions");
    if(!host||document.querySelector("[data-aelia-install]"))return;
    const button=document.createElement("button");button.type="button";button.className="btn secondary aelia-install-button";button.dataset.aeliaInstall="";button.textContent="Install AELIA workspace";
    button.addEventListener("click",async()=>{
      if(installPrompt){installPrompt.prompt();const choice=await installPrompt.userChoice;installPrompt=null;if(choice?.outcome==="accepted")button.hidden=true;return;}
      const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(ios?"To install AELIA, tap Share, then Add to Home Screen.":"Open Chrome's menu and choose Install app or Add to Home screen. Make sure you are on app.aeliaai.org.ng.");
    });
    host.prepend(button);if(standalone())button.hidden=true;
  };
  window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;});
  window.addEventListener("appinstalled",()=>{installPrompt=null;const button=document.querySelector("[data-aelia-install]");if(button)button.hidden=true;});
  if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/app-sw.js",{scope:"/"}).catch(error=>console.warn("AELIA app offline shell unavailable",error)));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addButton);else addButton();
  setTimeout(addButton,900);
})();
