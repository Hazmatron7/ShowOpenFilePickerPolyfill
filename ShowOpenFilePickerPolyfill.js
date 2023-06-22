

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
          excludeAcceptAllOption: false, // HTML 5 file input always has the accept all option.
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
               data.files[f] = new File([""], file.name);
             }
           } else {
             /*
                From here, permissions are not available. So let's try to atempt to get it inside a try/catch.
                If it errors with a 'NotAllowedError' Dom Exception, then we can't do much, so just create a temp file 
                with no data and set the file name.
             */
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
         // Oops it looks like the user has pressed cancel.
         data.hasCanceled = true;
       } else {
         throw err;
       }
         
  } else {
    /*
      if window.showOpenFilePicker() is not avaible then use this polyfill.
      This poylfill uses a hidden HTML5 file input tag and trigged.
      
      sources:
        https://stackoverflow.com/questions/69118076/window-showopenfilepicker-polyfill
        https://stackoverflow.com/questions/76193866/detect-user-closing-the-file-input-window
    */
    
    //convert the types parameter into a string
    let acceptArr = options.types.map((type) => type.accept);
    acceptArr = acceptArr.flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]));
    
    //setup hidden HTML5 input tag
    let input = document.createElement("input");
    input.type = "file";
    input.multiple = options.multiple;
    input.accept = acceptArr.join(",");
    input.style.display = "none";
    
    //append to body
    document.body.appendChild(input);
    
    //open file input
    input.click();
    
    input.value = "";
    
    let fileClosed = false;
    let ua = navigator.userAgent.toLowerCase();
    let firefoxOrSafari = ua.includes("firefox") || ua.includes("safari");
    let eventType = firefoxOrSafari ? "mouseover" : "focus";
    
    /*
      This event is triggered after the file input is closed thanks to the while loop.
      
      Once the file dialog is closed, the viewport is unmuted and the events will trigger.
      This will event will cause the while loop to break the cycle.
    */
    let closeEvent = () => fileClosed = true;
    window.addEventListener(eventType, closeEvent);
    
    // Keep lopping until otherwise
    while (!fileClosed) {
      await sleep(100);
      !firefoxOrSafari && input.focus(); // equivalent to: if (!firefoxOrSafari) input.focus();
    }
    
    // once the waiting for input is done remove the event and wait for 1 second to give the web browser a chance to update.
    window.removeEventListener(eventType, closeEvent);
    await sleep(1000); //this is there so the web browser can update
    
    if (!input.files.length) {
      // if no files present, then it's quite possible that the user has canceled it
      data.hasCanceled = true;
    } else {
      // else the user definetley has selected some files to upload
      data.files = Array.from(input.files);
    }
    
    // What!!! Why is this input tag still here? We don't need it anymore! :P
    document.body.removeChild(input);
  }
  
  return data;
}




// Utilites:

// This function serves as a delay timeout
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// This function checks an object that has a function that exists
function hasFunction(obj, prop) {
  return prop in obj && typeof obj[prop] === "function";
}
