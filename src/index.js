/**
 * Plugin Name : zTip
 * Version     : 2.0.0
 * Author      : Andrew Surdu
 * Author URL  : https://zerowp.com/
 * Plugin URL  : http://ztip.zerowp.com/
 * License     : MIT
 */
import Tooltip from "./Tooltip";

window.zTip = function (selector, options = {}) {
    new Tooltip(selector, options);
}
