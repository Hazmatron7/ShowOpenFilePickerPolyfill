# ShowOpenFilePickerPolyfill

This is a (<strong>sort of</strong>) polyfill for ```window.showOpenFilePicker()```. This polyfill uses a hidden HTML5 file input tag with file dialog closing detection included.




## Usage
<strong>IMPORTANT: </strong> For this to work, make sure the ```OpenFile()``` function is inside of some kind of user gesture based event.

The parameters of ```openFile()``` are the same as ```window.showOpenFilePicker()``` specified <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker">here on the MDN site</a>. Please note that 'excludeAcceptAllOption' will be ignored and will always be false for this polyfill as the idea is to keep functionality mostly the same.
```javascript
  document.getElementById("btn").addEventListener("click", (ev) => {
      openFile({
          multiple: false,
          types: [{
              description: "Images",
              accept: {
                "image/*: [".png", ".jpeg", ".jpg",],
              },
          ]},
      }).then((data) => {
          if (data.hasCanceled) {
              console.log("User has aborted file input");
          } else {
              console.log("User has selected files: ", data.files);
          }
      }).catch((err) => {
          console.log(err);
      });
  });
```

## Return Value
The method always returns a promise with a value of an object.

#### Properties:
  - <strong>hasCanceled</strong>:   returns a boolean indicating if the user has aborted/canceled the file dialog.
  - <strong>files</strong>:         returns an Array with <a href="https://developer.mozilla.org/en-US/docs/Web/API/File">File</a> objects inside. This Array will return with a length of 0 if hasCanceled is true.

<strong>Note:</strong> Some files in the array object could have no data. This is because, when ```window.showOpenFilePicker()``` is used, it is quite possible that the permission status is denied for reading files. To make up for this instead of returning null, it creates a new File object with no data and sets the file name from the name property from the ```SystemFileHandle``` Object
