// Theme choice (light / dark; absent means follow the device). Kept per browser, not synced.
// THEME_SCRIPT runs in <head> before the first paint so a saved choice shows without a flash.
export const THEME_KEY = 'ca-revise:v1:theme';
export const THEME_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
