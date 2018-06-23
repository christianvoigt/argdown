import { MessagePoster } from "./messaging";

export const initMenu = (messaging: MessagePoster) => {
  document.addEventListener(
    "click",
    event => {
      if (!event) {
        return;
      }

      let node: any = event.target;
      while (node) {
        if (
          node.tagName &&
          node.tagName === "A" &&
          node.dataset &&
          node.dataset.message
        ) {
          if (node.dataset.message === "didChangeView") {
            messaging.postMessage(node.dataset.message, {
              view: node.dataset.view
            });
          } else if (node.dataset.message === "didChangeLockMenu") {
            console.log("sending didChangeLockMenu: " + node.dataset.lockmenu);
            messaging.postMessage(node.dataset.message, {
              lockMenu: node.dataset.lockmenu
            });
          }
          break;
        }
        node = node.parentNode;
      }
    },
    true
  );
};
