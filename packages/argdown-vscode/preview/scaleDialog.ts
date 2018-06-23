export const openScaleDialog = (callback: (scale: number) => void) => {
  var dialog = document.createElement("div");
  dialog.id = "scale-dialog";
  dialog.innerHTML = `<div class="dialog-header"><h3>PNG Scale</h3></div>
  <div class="dialog-content">
  <p>Only the currently visible part of the map will be exported to PNG. By default the image size will be the same as the current size of the preview window. You can zoom out to show the complete map and enlarge the image, by entering a scale factor larger than 1:</p>
  <input id="scale-input" type="number" value="1">
  </div>
  <div class="dialog-footer"><button id="scale-submit" type="button" value="Submit">Submit</button>
  <button id="scale-cancel" type="button" value="Cancel">Cancel</button></div>`;
  document.body.appendChild(dialog);
  var input: HTMLInputElement = <HTMLInputElement>document.getElementById(
    "scale-input"
  );
  var cancel: HTMLElement = <HTMLElement>document.getElementById(
    "scale-cancel"
  );
  var submit: HTMLElement = <HTMLElement>document.getElementById(
    "scale-submit"
  );
  cancel.addEventListener("click", () => {
    dialog.remove();
  });
  submit.addEventListener("click", () => {
    dialog.remove();
    callback(parseFloat(input.value) || 1);
  });
};
