

/*

  parameters: {
    multiple: Boolean,
    types: Object[],
  }

*/


async function openFile(options) {
  
  let data = {
    hasCanceled: false,
    files: [],
  };
  
  if (hasFunction(window, "showOpenFilePicker")) {
     try {
       let handle = await window.showOpenFilePicker({
          types: options.types,
          multiple: options.multiple,
          excludeAcceptAllOption: false,
       });
       
       for (let f = 0; f < handle.length; f++) {
         if (handle[f].kind === "file") {
           let file = handle[f];
           
           if (hasFunction(file, "queryPermission") && hasFunction(file, "requestPermission")) {
             let opts = {mode: "read"};
             if ((await file.queryPermission(opts)) !== "granted") {
               if ((await file.requestPermission(opts)) === "granted") {
                 data.files[f] = await file.getFile();
               } else {
                 data.files[f] = new File([""], file.name);
               }
             } else {
               data.files[f] = new File*[""], file.name);
             }
           } else {
             try {
               let t = await file.getFile();
               data.files[f] = t;
             } catch (err) {
               if (err.name === "NotAllowedError") {
                 data.files[f] = new File([""], file.name);
               }
             }
           }
         }
       }
       
     } catch (err) {
       if (err.name === "AbortError" && err.message.includes("user aborted")) {
         data.hasCanceled = true;
       } else {
         throw err;
       }
         
  } else {
    
    let acceptArr = options.types.map((type) => type.accept);
    acceptArr = acceptArr.flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]));
    
    let input = document.createElement("input");
    input.type = "file";
    input.multiple = options.multiple;
    input.accept = acceptArr.join(",");
    input.style.display = "none";
    
    document.body.appendChild(input);
    
    input.click();
    
    input.value = "";
    
    let fileClosed = false;
    let ua = navigator.userAgent.toLowerCase();
    let firefoxOrSafari = ua.includes("firefox") || ua.includes("safari");
    let eventType = firefoxOrSafari ? "mouseover" : "focus";
    
    let closeEvent = () => fileClosed = true;
    window.addEventListener(eventType, closeEvent);
    
    while (!fileClosed) {
      await sleep(100);
      !firefoxOrSafari && input.focus(); // equivalent to: if (!firefoxOrSafari) input.focus();
    }
    
    window.removeEventListener(eventType, closeEvent);
    await sleep(1000); //this is there so the web browser can update
    
    if (!input.files.length) {
      data.hasCanceled = true;
    } else {
      data.files = Array.from(input.files);
    }
    document.body.removeChild(input);
  }
  
  return data;
}




// Utilites:

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function hasFunction(obj, prop) {
  return prop in obj && typeof obj[prop] === "function";
}
