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
import Gio from 'gi://Gio';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {execCommand} from "./process_helper.js";

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {

    get_current_status() {
      execCommand(["nextdns", "status"]).then(res => {
        this.enabled = res.trim() === "running";
        this.set_current_status(this.enabled);
      });
    }
    
    set_status(enable) {
    this.set_current_status(null, true);
    if(enable) {
        execCommand(["pkexec", "bash", "-c", "nextdns start && nextdns activate"]).then(res => {
        if(res === "")
        this.set_current_status(enable);
      });
      } else {
      execCommand(["pkexec", "bash", "-c", "nextdns stop && nextdns deactivate && systemctl restart systemd-resolved.service"]).then(res => {
      if(res === "")
       this.set_current_status(enable);
      });
      }
    }
    
    set_current_status(enabled) {
    let text = "";
        if(enabled === null) {
        text = "Changing status...";
      } else {
      if(enabled !== this.enabled) {
      this.enabled = enabled;
      }
      if(this.enabled) {
        text = "Disable NextDNS"
      } else if(!this.enabled) {
        text = "Enable NextDNS"
      } else {
        text = "An error occurred.";
      }
      }
      this.menu_item.label.text = text;
     }
     //@@Icon start
     _setIconOriginal() {
     this.icon.add_style_class_name('blue');
     this.icon.remove_style_class_name('white');
    }

    _setIconMonochrome() {
      this.icon.add_style_class_name('white');
      this.icon.remove_style_class_name('blue');
    }
    _updateIconColor() {
    let monochrome = this._settings.get_boolean('monochrome-icon');

    if (monochrome) {
        this._setIconMonochrome();
    } else {
        this._setIconOriginal();
    }
    }
//@@Icon end
    _init(settings) {
        super._init(0.2, _('NextDNS Indicator'));
        this._settings = settings;
        this._settings.connect('changed::monochrome-icon', (settings, key) => {
            this._updateIconColor();
        });
        this.icon = new St.Icon({
            style_class: 'system-status-icon icon',
        });
        this.add_child(this.icon);
         this._updateIconColor();
        this.get_current_status();
        let item = new PopupMenu.PopupMenuItem("Loading status...", {});
        item.connect('activate', () => {
            this.set_status(!this.enabled);
        });
        this.menu_item = item;
       
        this.menu.addMenuItem(this.menu_item);
    }
});

export default class NextDNSExtension extends Extension {
    enable() {
        this._indicator = new Indicator(this.getSettings('org.gnome.shell.extensions.nextdns@mysticnico.github.com'));
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
