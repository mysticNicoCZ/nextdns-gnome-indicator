/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from "gi://GLib";

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {

    get_current_status() {
      let res = GLib.spawn_command_line_sync("nextdns status");
      if(res[3] === 0) {
      return new TextDecoder().decode(res[1]).trim();
      } else {
      throw Error("An error occurred");
      }
    }
    set_status(enable) {
    let res;
    if(enable) {
       res = GLib.spawn_command_line_sync('pkexec nextdns start && nextdns activate');
      } else {
      res = GLib.spawn_command_line_sync('pkexec nextdns stop && nextdns deactivate');
      }
      log(res);
      if(res[3] === 0) {
       this.enabled = enable;
       this.set_current_text();
      } else {
        log("Error!");
      }
    }
    
    set_current_text() {
    let text = "";
      if(this.enabled) {
        text = "Disable NextDNS"
      } else if(!this.enabled) {
        text = "Enable NextDNS"
      } else {
        text = "An error occurred.";
      }
      this.menu_item.label.text = text;
     }
    
    _init() {
        super._init(0.1, _('NextDNS Indicator'));
        this.add_child(new St.Icon({
            style_class: 'system-status-icon nextdns-icon',
        }));
        
        this.enabled = this.get_current_status() === "running";
        log(this.enabled)
        let item = new PopupMenu.PopupMenuItem("Toggle", {});
        item.connect('activate', () => {
            this.set_status(!this.enabled);
        });
        this.menu_item = item;
        this.set_current_text();
        this.menu.addMenuItem(this.menu_item);
    }
});

export default class NextDNSExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
