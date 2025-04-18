import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class ExamplePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings('org.gnome.shell.extensions.nextdns@mysticnico.github.com');
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Configure the appearance of the extension'),
        });
        page.add(group);

        // Create a new preferences row
        const row = new Adw.SwitchRow({
            title: _('Monochrome indicator'),
            subtitle: _('Whether to show the panel indicator in monochrome colors'),
        });
        group.add(row);

        window._settings = this.getSettings();
        window._settings.bind('monochrome-icon', row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
