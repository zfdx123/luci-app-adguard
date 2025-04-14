'use strict';
'require view';
'require fs';
'require form';
'require poll';
'require uci';
'require rpc';
'require tools.widgets as widgets';

const callServiceList = rpc.declare({
    object: 'service',
    method: 'list',
    params: ['name'],
    expect: { '': {} }
});

function getServiceStatus() {
    return L.resolveDefault(callServiceList('adguard'), {}).then((res) => {
        var isRunning = false;
        try {
            isRunning = res['adguard']['instances']['adguardhome-c']['running'];
        } catch (e) { }
        return isRunning;
    });
}

function renderStatus(isRunning, version) {
    var spanTemp = '<em><span style="color:%s"><strong>%s (%s) %s</strong></span></em>';
    var renderHTML;
    if (isRunning)
        renderHTML = spanTemp.format('green', _('AdGuardHome'), version, _('Running'));
    else
        renderHTML = spanTemp.format('red', _('AdGuardHome'), version, _('Not Running'));

    return renderHTML;
}

function getAdguadhomeFeatures(){
    const callGetAdguardhomeFeatures = rpc.declare({
        object: 'luci.adguard',
        method: 'adguardhome_get_features',
        expect: { '': {} }
    });
    return L.resolveDefault(callGetAdguardhomeFeatures(), {});
}

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('adguard'),
            getAdguadhomeFeatures()
        ]);
    },
    render: async function (data) {
        var m, s, o;

        var features = data[1];

        m = new form.Map('adguard', _('AdGuardHome'),
            _('Simple LuCI web controller for AdGuardHome'));

        s = m.section(form.TypedSection);
        s.render = function () {
            poll.add(function () {
                return L.resolveDefault(getServiceStatus()).then((res) => {
                    var view = document.getElementById('service_status');
                    view.innerHTML = renderStatus(res, features.version);
                });
            });

            return E('div', { class: 'cbi-section', id: 'status_bar' }, [
                    E('p', { id: 'service_status' }, _('Collecting data...'))
            ]);
        }
        
        s = m.section(form.NamedSection, 'default', 'adguard');
        s.tab('settings', _('Basic Settings'));

        o = s.taboption('settings',form.Flag, 'enabled', _('Enable'), _('Enable AdGuardHome service'));
        o.rmempty = false;

        o = s.taboption('settings',form.Value, 'port', _('DNS Port'), _('AdGuardHome DNS server port'));
        o.placeholder = '11553';
        o.rmempty = false;

        o = s.taboption('settings',form.Value, 'http_port', _('Web Interface Port'), _('Web management interface port'));
        o.placeholder = '3000';
        o.rmempty = false;

        o = s.taboption('settings', form.Value, 'redirect', _('Redirect Mode'), _('DNS traffic redirection method'));
        o.value('dnsmasq-upstream', _('Run as dnsmasq upstream server'));
        o.value('replace-dnsmasq', _('Replace dnsmasq completely'));
        o.value('none', _('No redirection'));
        o.default = 'none';
        o.rmempty = false;

        o = s.taboption('settings',form.Value, 'config_path', _('Configuration Path'), _('Path to AdGuardHome configuration file'));
        o.placeholder = '/etc/AdGuardHome.yaml';
        o.rmempty = false;

        o = s.taboption('settings',form.Value, 'work_dir', _('Working Directory'), _('AdGuardHome working directory (contains rules, logs and database)'));
        o.placeholder = '/var/lib/adguardhome';
        o.rmempty = false;

        o = s.taboption('settings',form.Value, 'log_file', _('Log File'), _('AdGuardHome runtime log file (set to "syslog" for system log, leave empty for no logging)'));
        o.placeholder = '/tmp/adguardhome.log';
        o.rmempty = false;

        return m.render();
    }
});